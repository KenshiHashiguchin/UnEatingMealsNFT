package utils

import "math/rand"

//ランダム文字列生成
func GenerateRandomString(n int) string {
	letters := []rune("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ._-")
	b := make([]rune, n)
	for i := range b {
		//b[i] = letters[Rand.Intn(len(letters))]
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
