package repository

import (
	db "github.com/un_eating_meals/database"
	model "github.com/un_eating_meals/models"
	"gorm.io/gorm"
)

type UserRepo struct{}

func (repo UserRepo) FindById(id uint) (*model.User, error) {
	db := db.GetDB()
	user := &model.User{}
	err := db.Where("id = ?", id).Find(user).Error
	return user, err
}

func (repo UserRepo) FindByEmail(email string) (*model.User, error) {
	db := db.GetDB()
	user := &model.User{}
	err := db.Where("email = ?", email).Find(user).Error
	return user, err
}

func (repo UserRepo) Create(user *model.User) (err error) {
	db := db.GetDB()
	return db.Create(user).Error
}

func (repo UserRepo) UpdateAddressAndEncryptionPrivateKey(user *model.User, address, encryptionPrivateKey string) (err error) {
	db := db.GetDB()
	return db.Model(user).Updates(model.User{Address: address, EncryptionPrivateKey: encryptionPrivateKey}).Error
}

func (repo UserRepo) DeleteAddressAndEncryptionPrivateKey(user *model.User) (err error) {
	db := db.GetDB()
	return db.Model(user).Updates(map[string]interface{}{
		"address":                gorm.Expr("NULL"),
		"encryption_private_key": gorm.Expr("NULL"),
	}).Error
}
