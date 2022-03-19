package model

import (
	"time"
)

type GameScore struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	GameId    uint      `json:"game_id"`
	MosaicId  string    `json:"mosaic_id"`
	Score     uint      `json:"score"`
	CreatedAt time.Time `json:"created_at"`
}
