package controllers

import (
	"github.com/coreos/go-oidc"
	"github.com/gin-gonic/gin"
	config "github.com/un_eating_meals/config"
	model "github.com/un_eating_meals/models"
	"github.com/un_eating_meals/models/repository"
	"github.com/un_eating_meals/services"
	"github.com/un_eating_meals/utils"
	"golang.org/x/oauth2"
	"net/http"
	"strings"
)

type UserController struct {
	userRepo          repository.UserRepo
	socialAccountRepo repository.SocialAccountRepo

	userService services.UserService
}

func NewUserController() *UserController {
	return new(UserController)
}

// ログイン済みであればユーザ情報を返却する
func (uc *UserController) GetUser(c *gin.Context) {
	clientToken := c.Request.Header.Get("Authorization")
	extractedToken := strings.Split(clientToken, "Bearer ")
	if clientToken == "" || len(extractedToken) != 2 {
		c.JSON(http.StatusForbidden, gin.H{"extracted": extractedToken, "token": clientToken})
		return
	}
	user, err := utils.GetAuthUserByTokenString(strings.TrimSpace(extractedToken[1]))
	if err == nil {
		c.JSON(http.StatusOK, user)
		return
	}
	c.JSON(http.StatusUnauthorized, gin.H{})
}

func (uc *UserController) SocialLogin(c *gin.Context) {
	providerName := c.Param("provider")
	providerConf := config.GetAuthProvider(providerName)
	if providerConf == nil {
		c.JSON(http.StatusNotFound, gin.H{})
		return
	}
	provider, err := oidc.NewProvider(c, providerConf["issur"])
	if err != nil {
		utils.PutLog(err)
	}

	redirectURL := config.GetEnv("URL_USER")
	config := oauth2.Config{
		ClientID:     providerConf["client_id"],
		ClientSecret: providerConf["client_secret"],
		Endpoint:     provider.Endpoint(),
		RedirectURL:  redirectURL + "?provider=" + providerName,
		Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
	}

	state := utils.GenerateRandomString(10)
	authURL := config.AuthCodeURL(state)

	c.JSON(http.StatusOK, gin.H{
		"redirect_url": authURL,
	})
}

func (uc *UserController) SocialLoginCallback(c *gin.Context) {
	claim := uc.getUser(c)
	if len(claim) == 0 {
		c.JSON(http.StatusNotFound, gin.H{})
		return
	}

	// Sign in
	user := &model.User{}
	social, err := uc.socialAccountRepo.FindBySub(claim["sub"].(string))
	if err != nil {
		// CreateUser
		user.Name = claim["name"].(string)
		user.Email = claim["email"].(string)
		user.Status = model.USER_STATUS_NORMAL

		user.SocialAccount.Provider = "google"
		user.SocialAccount.Sub = claim["sub"].(string)
		user.SocialAccount.Email = user.Email
		user.SocialAccount.Name = user.Name
		err = uc.userRepo.Create(user)
	} else {
		user, _ = uc.userRepo.FindById(social.UserId)
	}

	jwtToken := uc.userService.GenerateJWTToken(user)
	jwtClaim, _ := utils.GetAuthUserByTokenString(jwtToken)

	c.JSON(http.StatusOK, gin.H{
		"jwt":                    jwtToken,
		"id":                     user.ID,
		"email":                  user.Email,
		"name":                   user.Name,
		"address":                user.Address,
		"encryption_private_key": user.EncryptionPrivateKey,
		"expires_at":             jwtClaim.ExpiresAt,
	})
}

func (uc *UserController) getUser(c *gin.Context) map[string]interface{} {
	providerName := c.Param("provider")
	providerConf := config.GetAuthProvider(providerName)
	if providerConf == nil {
		utils.PutLog("not provider")
		return nil
	}
	provider, err := oidc.NewProvider(c, providerConf["issur"])
	redirectURL := config.GetEnv("URL_USER")
	config := oauth2.Config{
		ClientID:     providerConf["client_id"],
		ClientSecret: providerConf["client_secret"],
		Endpoint:     provider.Endpoint(),
		RedirectURL:  redirectURL + "?provider=" + providerName,
		Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
	}
	// codeをもとにトークンエンドポイントから IDトークン を取得
	code := c.Query("code")
	oauth2Token, err := config.Exchange(c, code)
	if err != nil {
		return nil
	}

	// IDトークンを取り出す
	rawIDToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		utils.PutLog("not provider")
		return nil
	}

	oidcConfig := &oidc.Config{
		ClientID: providerConf["client_id"],
	}

	verifier := provider.Verifier(oidcConfig)
	// IDトークンの正当性の検証
	idToken, err := verifier.Verify(c, rawIDToken)
	if err != nil {
		return nil
	}

	idTokenClaims := map[string]interface{}{}
	if err := idToken.Claims(&idTokenClaims); err != nil {
		return nil
	}

	return idTokenClaims
}

func (uc *UserController) RegisterAddress(c *gin.Context) {
	var data struct {
		Address              string `json:"address"`
		EncryptionPrivateKey string `json:"encryption_private_key"`
	}
	c.BindJSON(&data)
	if len(data.Address) != 39 || len(data.EncryptionPrivateKey) == 0 {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "invalid address",
		})
		return
	}

	clientToken := c.Request.Header.Get("Authorization")
	extractedToken := strings.Split(clientToken, "Bearer ")
	if clientToken == "" || len(extractedToken) != 2 {
		c.JSON(http.StatusForbidden, gin.H{"extracted": extractedToken, "token": clientToken})
		return
	}
	userClaim, err := utils.GetAuthUserByTokenString(strings.TrimSpace(extractedToken[1]))
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"extracted": extractedToken, "token": clientToken})
		return
	}
	user, _ := uc.userRepo.FindById(userClaim.UserId)
	err = uc.userRepo.UpdateAddressAndEncryptionPrivateKey(user, data.Address, data.EncryptionPrivateKey)
	if err != nil {
		utils.PutLog("Address更新エラー")
		c.JSON(http.StatusForbidden, gin.H{"extracted": extractedToken, "token": clientToken})
		return
	}

	jwtToken := uc.userService.GenerateJWTToken(user)
	c.JSON(http.StatusOK, gin.H{"jwt": jwtToken})
}

func (uc *UserController) DeleteAddress(c *gin.Context) {
	clientToken := c.Request.Header.Get("Authorization")
	extractedToken := strings.Split(clientToken, "Bearer ")
	if clientToken == "" || len(extractedToken) != 2 {
		c.JSON(http.StatusForbidden, gin.H{"extracted": extractedToken, "token": clientToken})
		return
	}
	userClaim, err := utils.GetAuthUserByTokenString(strings.TrimSpace(extractedToken[1]))
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"extracted": extractedToken, "token": clientToken})
		return
	}
	user, _ := uc.userRepo.FindById(userClaim.UserId)
	err = uc.userRepo.DeleteAddressAndEncryptionPrivateKey(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "サーバーエラーが発生しました。お手数ですが運営にお問い合わせください。"})
		return
	}

	jwtToken := uc.userService.GenerateJWTToken(user)
	c.JSON(http.StatusOK, gin.H{"jwt": jwtToken})
}
