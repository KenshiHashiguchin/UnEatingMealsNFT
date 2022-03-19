package repository

import (
	db "github.com/un_eating_meals/database"
	model "github.com/un_eating_meals/models"
)

type GameAccountRepo struct{}

func (repo GameAccountRepo) FindAll() ([]model.GameAccount, error) {
	db := db.GetDB()
	var gameAccounts []model.GameAccount
	err := db.Find(&gameAccounts).Error
	return gameAccounts, err
}
