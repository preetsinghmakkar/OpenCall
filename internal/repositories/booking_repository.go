package repositories

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/preetsinghmakkar/OpenCall/internal/dtos"
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

func (r *BookingRepository) HasConflictTx(
	ctx context.Context,
	tx *sql.Tx,
	mentorID uuid.UUID,
	bookingDate time.Time,
	start time.Time,
	end time.Time,
) (bool, error) {

	const query = `
	SELECT 1
	FROM bookings
	WHERE mentor_id = $1
	  AND booking_date = $2
	  AND status IN ('pending','confirmed')
	  AND start_time < $4
	  AND end_time > $3
	FOR UPDATE
	LIMIT 1
	`

	row := tx.QueryRowContext(
		ctx,
		query,
		mentorID,
		bookingDate,
		start,
		end,
	)

	var dummy int
	err := row.Scan(&dummy)

	if err == sql.ErrNoRows {
		return false, nil
	}

	if err != nil {
		return false, err
	}

	return true, nil
}

func (r *BookingRepository) CreateTx(
	ctx context.Context,
	tx *sql.Tx,
	b *models.Booking,
) error {

	const query = `
	INSERT INTO bookings (
		id,
		mentor_id,
		user_id,
		service_id,
		booking_date,
		start_time,
		end_time,
		status,
		price_cents,
		currency,
		created_at,
		updated_at
	)
	VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())
	`

	_, err := tx.ExecContext(
		ctx,
		query,
		b.ID,
		b.MentorID,
		b.UserID,
		b.ServiceID,
		b.BookingDate,
		b.StartTime,
		b.EndTime,
		b.Status,
		b.PriceCents,
		b.Currency,
	)

	return err
}

func (r *BookingRepository) WithTx(
	ctx context.Context,
	fn func(tx *sql.Tx) error,
) error {

	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
	})
	if err != nil {
		return err
	}

	if err := fn(tx); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func (r *BookingRepository) GetByUserID(
	userID uuid.UUID,
) ([]*dtos.MyBookingResponse, error) {

	const query = `
	SELECT
		b.id,
		u.username AS mentor_username,
		s.title AS service_title,
		b.booking_date,
		b.start_time,
		b.end_time,
		b.status,
		b.price_cents,
		b.currency
	FROM bookings b
	JOIN mentor_profiles mp ON mp.id = b.mentor_id
	JOIN users u ON u.id = mp.user_id
	JOIN mentor_services s ON s.id = b.service_id
	WHERE b.user_id = $1
	ORDER BY b.booking_date DESC, b.start_time DESC
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []*dtos.MyBookingResponse

	for rows.Next() {
		var r dtos.MyBookingResponse
		var date time.Time
		var start time.Time
		var end time.Time

		err := rows.Scan(
			&r.ID,
			&r.Mentor,
			&r.Service,
			&date,
			&start,
			&end,
			&r.Status,
			&r.Price,
			&r.Currency,
		)
		if err != nil {
			return nil, err
		}

		r.Date = date.Format("2006-01-02")
		r.StartTime = start.Format("15:04")
		r.EndTime = end.Format("15:04")

		result = append(result, &r)
	}

	return result, nil
}
