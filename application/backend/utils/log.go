package utils

import (
	"io"
	"log"
	"os"
)

func PutLog(args ...interface{}) {
	logfile, err := os.OpenFile("./un_eating_meals.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		panic("cannnot open test.log:" + err.Error())
	}
	defer logfile.Close()

	// iorule.MultiWriteで、
	// 標準出力とファイルの両方を束ねて、
	// logの出力先に設定する
	log.SetOutput(io.MultiWriter(logfile, os.Stdout))

	log.SetFlags(log.Ldate | log.Ltime)
	log.Println(args...)
	//logger.SetPrefix("ERROR ")
	//logger.Println(args...)
}
