package main

import (
	"github.com/gin-gonic/gin"
	"github.com/un_eating_meals/config"
	db "github.com/un_eating_meals/database"
	"github.com/un_eating_meals/server"
)

func main() {
	// database
	db.Connection()
	gin.SetMode(config.GetEnv("GIN_MODE"))

	if err := server.Init(); err != nil {
		panic(err)
	}
}
