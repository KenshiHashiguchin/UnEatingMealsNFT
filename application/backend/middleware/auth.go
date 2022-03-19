package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/un_eating_meals/utils"
	"net/http"
	"strings"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientToken := c.Request.Header.Get("Authorization")
		extractedToken := strings.Split(clientToken, "Bearer ")
		if clientToken == "" || len(extractedToken) != 2 {
			c.JSON(http.StatusForbidden, gin.H{"extracted": extractedToken, "token": clientToken})
			return
		}
		_, err := utils.GetAuthUserByTokenString(strings.TrimSpace(extractedToken[1]))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{})
			return
		}

		c.Next()
	}
}
