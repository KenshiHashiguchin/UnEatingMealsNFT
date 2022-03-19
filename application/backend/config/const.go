package config

import "time"

var (
	//ログインセッションの保持期間 24時間
	JWTExpHour time.Duration = 24 //TODO TEST
)
