package config

var (
	google = map[string]string{
		"client_id":     GetEnv("GOOGLE_ID"),
		"client_secret": GetEnv("GOOGLE_SECRET"),
		"callback":      "/api/callback/auth/google",
		"issur":         "https://accounts.google.com",
	}
	twitter = map[string]string{
		"client_id":     GetEnv("TWITTER_ID"),
		"client_secret": GetEnv("TWITTER_SECRET"),
		"callback":      "/api/callback/auth/twitter",
		"issur":         "https://api.twitter.com/oauth/authenticate",
	}
)

func GetAuthProvider(provider string) map[string]string {
	switch provider {
	case "google":
		return google
	case "twitter":
		return twitter
	default:
		return nil
	}
}
