package config

import "github.com/dgrijalva/jwt-go"

type UserClaims struct {
	UserId               uint   `json:"id,omitempty"`
	Name                 string `json:"name,omitempty"`
	Email                string `json:"email,omitempty"`
	Address              string `json:"address,omitempty"`
	EncryptionPrivateKey string `json:"encryption_private_key,omitempty"`
	jwt.StandardClaims
}
