package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/un_eating_meals/models/repository"
	"net/http"
)

type GameAccountController struct {
	userRepo        repository.UserRepo
	gameAccountRepo repository.GameAccountRepo
	gameScoreRepo   repository.GameScoreRepo
}

func NewGameAccountController() *GameAccountController {
	return new(GameAccountController)
}

func (gac *GameAccountController) GetGameAccount(c *gin.Context) {
	gameAccounts, _ := gac.gameAccountRepo.FindAll()
	c.JSON(http.StatusOK, gin.H{
		"game_accounts": gameAccounts,
	})
}

func (gac *GameAccountController) GameResult(c *gin.Context) {
	var data struct {
		MosaicId string `json:"mosaic_id"`
		Score    uint   `json:"score"`
	}
	bindErr := c.BindJSON(&data)
	if bindErr != nil || data.Score == 0 || data.MosaicId == "" || len(data.MosaicId) != 16 {
		c.JSON(http.StatusNotFound, gin.H{})
		return
	}

	// game_id一旦決め打ち
	gameScore, err := gac.gameScoreRepo.FindByGameIdMosaicId(1, data.MosaicId)
	if err != nil {
		gameScore.GameId = 1
		gameScore.MosaicId = data.MosaicId
		gameScore.Score = data.Score
		gac.gameScoreRepo.Create(&gameScore)
	} else {
		if data.Score > gameScore.Score {
			gameScore.Score = data.Score
			gac.gameScoreRepo.Update(&gameScore)
		}
	}

	c.JSON(http.StatusOK, gin.H{})
}

func (gac *GameAccountController) GetGameResult(c *gin.Context) {
	gameScores, _ := gac.gameScoreRepo.FindAll()
	c.JSON(http.StatusOK, gin.H{
		"score": gameScores,
	})
}
