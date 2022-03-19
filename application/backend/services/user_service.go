package services

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/un_eating_meals/config"
	model "github.com/un_eating_meals/models"
	"github.com/un_eating_meals/utils"
	"time"
)

type UserService struct{}

func (uh UserService) GenerateJWTToken(user *model.User) string {
	claims := config.UserClaims{
		user.ID,
		user.Name,
		user.Email,
		user.Address,
		user.EncryptionPrivateKey,
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * config.JWTExpHour).Unix(),
		},
	}
	utils.PutLog(claims)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// 電子署名
	tokenString, _ := token.SignedString([]byte(config.GetEnv("JWT_SECRET_KEY")))
	return tokenString
}
