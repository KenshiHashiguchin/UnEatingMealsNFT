package model

import (
	"time"
)

type GameAccount struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Address   string    `json:"address"`
	CreatedAt time.Time `json:"created_at"`
}
