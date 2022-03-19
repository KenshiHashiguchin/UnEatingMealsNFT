package model

import (
	"time"
)

type SocialAccount struct {
	ID        uint `gorm:"primaryKey"`
	UserId    uint
	Provider  string
	Sub       string
	Email     string
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}
