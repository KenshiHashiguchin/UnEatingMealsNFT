package repository

import (
	db "github.com/un_eating_meals/database"
	model "github.com/un_eating_meals/models"
)

type SocialAccountRepo struct{}

func (repo SocialAccountRepo) FindBySub(sub string) (*model.SocialAccount, error) {
	db := db.GetDB()
	account := new(model.SocialAccount)
	err := db.Where("sub = ?", sub).First(account).Error
	return account, err
}
