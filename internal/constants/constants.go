package constants

import "time"

var MaxTime = 24 * time.Hour

type envKeys struct {
	Env                string
	ServerAddress      string
	CorsAllowedOrigins string
	DBDriver           string
	DBHost             string
	DBPort             string
	DBUser             string
	DBPassword         string
	DBName             string
}

type header struct {
	Origin        string
	ContentLength string
	ContentType   string
	Authorization string
}

var EnvKeys = envKeys{
	Env:                "ENV",
	ServerAddress:      "SERVER_ADDRESS",
	CorsAllowedOrigins: "CORS_ALLOWED_ORIGINS",
	DBDriver:           "DB_DRIVER",
	DBHost:             "DB_HOST",
	DBPort:             "DB_PORT",
	DBUser:             "DB_USER",
	DBPassword:         "DB_PASSWORD",
	DBName:             "DB_NAME",
}

var Headers = header{
	Origin:        "Origin",
	ContentLength: "Content-Length",
	ContentType:   "Content-Type",
	Authorization: "Authorization",
}
