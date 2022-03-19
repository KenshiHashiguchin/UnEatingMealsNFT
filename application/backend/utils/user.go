package utils

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/un_eating_meals/config"
)

func GetAuthUserByTokenString(tokenString string) (*config.UserClaims, error) {
	auth := &config.UserClaims{}
	_, err := jwt.ParseWithClaims(tokenString, auth, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.GetEnv("JWT_SECRET_KEY")), nil
	})

	if err != nil {
		return nil, err
	}

	return auth, nil
}
