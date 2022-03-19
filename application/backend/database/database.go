package db

import (
	"fmt"
	"github.com/un_eating_meals/config"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"os"
	"time"
)

var db *gorm.DB

func Connection() *gorm.DB {
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second,   // Slow SQL threshold
			LogLevel:                  logger.Silent, // Log level
			IgnoreRecordNotFoundError: true,          // Ignore ErrRecordNotFound error for logger
			Colorful:                  false,         // Disable color
		},
	)

	connect := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local",
		config.GetEnv("DB_USER"), config.GetEnv("DB_PASSWORD"), config.GetEnv("DB_HOST"), config.GetEnv("DB_PORT"), config.GetEnv("DB_DATABASE"),
	)

	database, err := gorm.Open(mysql.Open(connect), &gorm.Config{
		Logger: newLogger,
	})
	db = database
	if err != nil {
		log.Fatal(err)
	}
	return database
}

// GetDB returns database connection
func GetDB() *gorm.DB {
	return db
}
