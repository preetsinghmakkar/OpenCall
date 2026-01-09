package repositories

import (
	"context"
	"database/sql"
	"time"

	"github.com/preetsinghmakkar/OpenCall/internal/models"
)

type MentorRepository struct {
	db *sql.DB
}

func NewMentorRepository(db *sql.DB) *MentorRepository {
	return &MentorRepository{db: db}
}

func (r *MentorRepository) CreateProfile(
	profile *models.MentorProfile,
) error {

	const query = `
	INSERT INTO mentor_profiles (
		id,
		user_id,
		title,
		bio,
		timezone,
		is_active,
		created_at,
		updated_at
	)
	VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
	RETURNING created_at
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := r.db.QueryRowContext(
		ctx,
		query,
		profile.ID,
		profile.UserID,
		profile.Title,
		profile.Bio,
		profile.Timezone,
	).Scan(&profile.CreatedAt)

	return err
}
