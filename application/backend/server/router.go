package server

import (
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/un_eating_meals/config"
	"github.com/un_eating_meals/controllers"
	"github.com/un_eating_meals/middleware"
	"net/http"
)

// NewRouter is constructor for router
func NewRouter() (*gin.Engine, error) {
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	store := cookie.NewStore([]byte(config.GetEnv("APP_SECRET_KEY")))
	router.Use(sessions.Sessions("user_session", store))

	router.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{})
	})

	userController := controllers.NewUserController()
	router.GET("/auth/me", userController.GetUser)
	router.GET("/auth/redirect/:provider", userController.SocialLogin)
	router.GET("/callback/auth/:provider", userController.SocialLoginCallback)

	gameAccountController := controllers.NewGameAccountController()
	// game account取得
	router.GET("/game_account", gameAccountController.GetGameAccount)
	router.POST("/game_result", gameAccountController.GameResult)
	router.GET("/game_ranking", gameAccountController.GetGameResult)

	auth := router.Group("/")
	auth.Use(middleware.Auth())
	{
		auth.POST("/register/address", userController.RegisterAddress)
		auth.POST("/delete/address", userController.DeleteAddress)
	}

	return router, nil
}
