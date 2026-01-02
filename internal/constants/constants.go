package constants

import "time"

var maxtime = 24 * time.Hour

type envKeys struct {
	Env                string
	ServerAddress      string
	CorsAllowedOrigins string
	DBDriver           string
	DBSource           string
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
	DBSource:           "DB_SOURCE",
}

var Header = header{
	Origin:        "Origin",
	ContentLength: "Content-Length",
	ContentType:   "Content-Type",
	Authorization: "Authorization",
}
