package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	domain "github.com/pitgo/backend/internal/domain/request"
)

type RequestRepository struct {
	pool *pgxpool.Pool
}

func NewRequestRepository(pool *pgxpool.Pool) *RequestRepository {
	return &RequestRepository{pool: pool}
}

const baseColumns = `id, customer_id, provider_id, service_id, category, status, description, photo_url, total_price, notes, scheduled_at, address_id, latitude, longitude, accepted_at, started_at, completed_at, cancelled_at, created_at, updated_at`

func scanRequest(scanner interface{ Scan(dest ...any) error }) (*domain.ServiceRequest, error) {
	var req domain.ServiceRequest
	err := scanner.Scan(
		&req.ID, &req.CustomerID, &req.ProviderID, &req.ServiceID, &req.Category,
		&req.Status, &req.Description, &req.PhotoURL, &req.TotalPrice, &req.Notes,
		&req.ScheduledAt, &req.AddressID, &req.Latitude, &req.Longitude,
		&req.AcceptedAt, &req.StartedAt, &req.CompletedAt, &req.CancelledAt,
		&req.CreatedAt, &req.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &req, nil
}

func (r *RequestRepository) Create(ctx context.Context, req *domain.ServiceRequest) error {
	query := `INSERT INTO service_requests (id, customer_id, provider_id, service_id, category, status, description, photo_url, total_price, notes, scheduled_at, address_id, latitude, longitude, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`
	_, err := r.pool.Exec(ctx, query,
		req.ID, req.CustomerID, req.ProviderID, req.ServiceID, req.Category,
		req.Status, req.Description, req.PhotoURL, req.TotalPrice, req.Notes,
		req.ScheduledAt, req.AddressID, req.Latitude, req.Longitude,
		req.CreatedAt, req.UpdatedAt,
	)
	return err
}

func (r *RequestRepository) GetByID(ctx context.Context, id string) (*domain.ServiceRequest, error) {
	query := fmt.Sprintf(`SELECT %s FROM service_requests WHERE id = $1`, baseColumns)
	return scanRequest(r.pool.QueryRow(ctx, query, id))
}

func (r *RequestRepository) Update(ctx context.Context, req *domain.ServiceRequest) error {
	query := `UPDATE service_requests SET
		provider_id = $2, status = $3, description = $4, photo_url = $5,
		total_price = $6, notes = $7, accepted_at = $8, started_at = $9,
		completed_at = $10, cancelled_at = $11, updated_at = $12
		WHERE id = $1`
	_, err := r.pool.Exec(ctx, query,
		req.ID, req.ProviderID, req.Status, req.Description, req.PhotoURL,
		req.TotalPrice, req.Notes, req.AcceptedAt, req.StartedAt,
		req.CompletedAt, req.CancelledAt, req.UpdatedAt,
	)
	return err
}

func (r *RequestRepository) ListByCustomer(ctx context.Context, customerID string, status domain.Status, limit, offset int) ([]*domain.ServiceRequest, error) {
	query := fmt.Sprintf(`SELECT %s FROM service_requests WHERE customer_id = $1`, baseColumns)
	args := []any{customerID}
	argIdx := 2
	if status != "" {
		query += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
	args = append(args, limit, offset)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*domain.ServiceRequest
	for rows.Next() {
		req, err := scanRequest(rows)
		if err != nil {
			return nil, err
		}
		requests = append(requests, req)
	}
	return requests, nil
}

func (r *RequestRepository) ListByProvider(ctx context.Context, providerID string, status domain.Status, limit, offset int) ([]*domain.ServiceRequest, error) {
	query := fmt.Sprintf(`SELECT %s FROM service_requests WHERE provider_id = $1`, baseColumns)
	args := []any{providerID}
	argIdx := 2
	if status != "" {
		query += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
	args = append(args, limit, offset)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*domain.ServiceRequest
	for rows.Next() {
		req, err := scanRequest(rows)
		if err != nil {
			return nil, err
		}
		requests = append(requests, req)
	}
	return requests, nil
}

// ListAvailable finds open requests within radiusKm using the Haversine formula,
// optionally filtered by category, ordered by distance ascending.
func (r *RequestRepository) ListAvailable(ctx context.Context, lat, lng, radiusKm float64, category string, limit, offset int) ([]*domain.ServiceRequest, error) {
	// Haversine distance in km
	haversine := `(6371 * acos(
		cos(radians($1)) * cos(radians(latitude)) *
		cos(radians(longitude) - radians($2)) +
		sin(radians($1)) * sin(radians(latitude))
	))`

	query := fmt.Sprintf(`SELECT %s, %s AS distance_km
		FROM service_requests
		WHERE status = 'open' AND %s <= $3`, baseColumns, haversine, haversine)

	args := []any{lat, lng, radiusKm}
	argIdx := 4

	if category != "" {
		query += fmt.Sprintf(" AND category = $%d", argIdx)
		args = append(args, category)
		argIdx++
	}

	query += fmt.Sprintf(" ORDER BY distance_km ASC LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
	args = append(args, limit, offset)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*domain.ServiceRequest
	for rows.Next() {
		var req domain.ServiceRequest
		err := rows.Scan(
			&req.ID, &req.CustomerID, &req.ProviderID, &req.ServiceID, &req.Category,
			&req.Status, &req.Description, &req.PhotoURL, &req.TotalPrice, &req.Notes,
			&req.ScheduledAt, &req.AddressID, &req.Latitude, &req.Longitude,
			&req.AcceptedAt, &req.StartedAt, &req.CompletedAt, &req.CancelledAt,
			&req.CreatedAt, &req.UpdatedAt,
			&req.DistanceKm,
		)
		if err != nil {
			return nil, err
		}
		requests = append(requests, &req)
	}
	return requests, nil
}

func (r *RequestRepository) CreateItem(ctx context.Context, item *domain.RequestItem) error {
	query := `INSERT INTO request_items (id, request_id, service_id, service_name, quantity, unit_price, total_price)
			  VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.pool.Exec(ctx, query, item.ID, item.RequestID, item.ServiceID, item.ServiceName, item.Quantity, item.UnitPrice, item.TotalPrice)
	return err
}

func (r *RequestRepository) GetItems(ctx context.Context, requestID string) ([]*domain.RequestItem, error) {
	query := `SELECT id, request_id, service_id, service_name, quantity, unit_price, total_price FROM request_items WHERE request_id = $1`
	rows, err := r.pool.Query(ctx, query, requestID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*domain.RequestItem
	for rows.Next() {
		var item domain.RequestItem
		if err := rows.Scan(&item.ID, &item.RequestID, &item.ServiceID, &item.ServiceName, &item.Quantity, &item.UnitPrice, &item.TotalPrice); err != nil {
			return nil, err
		}
		items = append(items, &item)
	}
	return items, nil
}
