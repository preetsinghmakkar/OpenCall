package repositories

import (
	"database/sql"

	"github.com/preetsinghmakkar/OpenCall/internal/database"
	"github.com/preetsinghmakkar/OpenCall/internal/models"
)

type UserRepository struct {
	BaseSQLRepository database.BaseSQLRepository[models.User]
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{
		BaseSQLRepository: database.BaseSQLRepository[models.User]{DB: db},
	}
}
