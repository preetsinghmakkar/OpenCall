package repositories

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/preetsinghmakkar/OpenCall/internal/models"
)

type BookingRepository struct {
	db *sql.DB
}

func NewBookingRepository(db *sql.DB) *BookingRepository {
	return &BookingRepository{db: db}
}

func (r *BookingRepository) FindForMentorOnDate(
	mentorID uuid.UUID,
	date time.Time,
) ([]*models.Booking, error) {

	const query = `
	SELECT
		id,
		start_time,
		end_time
	FROM bookings
	WHERE mentor_id = $1
	  AND booking_date = $2
	  AND status IN ('pending', 'confirmed')
	`

	rows, err := r.db.Query(query, mentorID, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookings []*models.Booking

	for rows.Next() {
		var b models.Booking

		if err := rows.Scan(
			&b.ID,
			&b.StartTime,
			&b.EndTime,
		); err != nil {
			return nil, err
		}

		bookings = append(bookings, &b)
	}

	return bookings, nil
}
