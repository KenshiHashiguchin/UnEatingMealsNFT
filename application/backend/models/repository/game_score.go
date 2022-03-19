package repository

import (
	db "github.com/un_eating_meals/database"
	model "github.com/un_eating_meals/models"
)

type GameScoreRepo struct{}

func (repo GameScoreRepo) FindByGameIdMosaicId(gameId uint, mosaicId string) (model.GameScore, error) {
	db := db.GetDB()
	var gameScore model.GameScore
	err := db.Where("game_id = ?", gameId).Where("mosaic_id = ?", mosaicId).First(&gameScore).Error
	return gameScore, err
}

func (repo GameScoreRepo) Create(gameScore *model.GameScore) (err error) {
	db := db.GetDB()
	return db.Create(gameScore).Error
}

func (repo GameScoreRepo) Update(gameScore *model.GameScore) (err error) {
	db := db.GetDB()
	return db.Model(gameScore).Updates(gameScore).Error
}

func (repo GameScoreRepo) FindAll() ([]model.GameScore, error) {
	db := db.GetDB()
	var gameScores []model.GameScore
	err := db.Order("score desc").Find(&gameScores).Error
	return gameScores, err
}
