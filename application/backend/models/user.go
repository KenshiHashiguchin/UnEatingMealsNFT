package model

import (
	"time"
)

type User struct {
	ID                   uint `gorm:"primaryKey"`
	Name                 string
	Email                string
	Address              string
	EncryptionPrivateKey string
	Status               uint
	CreatedAt            time.Time
	UpdatedAt            time.Time

	// Relation
	SocialAccount SocialAccount
}

const (
	USER_STATUS_NORMAL = 1
)
