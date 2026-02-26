package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	domain "github.com/pitgo/backend/internal/domain/dispatch"
)

type DispatchRepository struct {
	pool *pgxpool.Pool
}

func NewDispatchRepository(pool *pgxpool.Pool) *DispatchRepository {
	return &DispatchRepository{pool: pool}
}

func (r *DispatchRepository) Create(ctx context.Context, d *domain.Dispatch) error {
	query := `INSERT INTO dispatches (id, request_id, provider_id, status, distance_km, expires_at, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.pool.Exec(ctx, query, d.ID, d.RequestID, d.ProviderID, d.Status, d.Distance, d.ExpiresAt, d.CreatedAt, d.UpdatedAt)
	return err
}

func (r *DispatchRepository) GetByID(ctx context.Context, id string) (*domain.Dispatch, error) {
	query := `SELECT id, request_id, provider_id, status, distance_km, expires_at, created_at, updated_at FROM dispatches WHERE id = $1`
	var d domain.Dispatch
	err := r.pool.QueryRow(ctx, query, id).Scan(&d.ID, &d.RequestID, &d.ProviderID, &d.Status, &d.Distance, &d.ExpiresAt, &d.CreatedAt, &d.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &d, nil
}

func (r *DispatchRepository) Update(ctx context.Context, d *domain.Dispatch) error {
	query := `UPDATE dispatches SET status = $2, updated_at = $3 WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, d.ID, d.Status, d.UpdatedAt)
	return err
}

func (r *DispatchRepository) GetByRequestID(ctx context.Context, requestID string) ([]*domain.Dispatch, error) {
	query := `SELECT id, request_id, provider_id, status, distance_km, expires_at, created_at, updated_at FROM dispatches WHERE request_id = $1`
	rows, err := r.pool.Query(ctx, query, requestID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dispatches []*domain.Dispatch
	for rows.Next() {
		var d domain.Dispatch
		if err := rows.Scan(&d.ID, &d.RequestID, &d.ProviderID, &d.Status, &d.Distance, &d.ExpiresAt, &d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, err
		}
		dispatches = append(dispatches, &d)
	}
	return dispatches, nil
}

func (r *DispatchRepository) GetPendingByProvider(ctx context.Context, providerID string) ([]*domain.Dispatch, error) {
	query := `SELECT id, request_id, provider_id, status, distance_km, expires_at, created_at, updated_at FROM dispatches WHERE provider_id = $1 AND status = 'pending' AND expires_at > NOW()`
	rows, err := r.pool.Query(ctx, query, providerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dispatches []*domain.Dispatch
	for rows.Next() {
		var d domain.Dispatch
		if err := rows.Scan(&d.ID, &d.RequestID, &d.ProviderID, &d.Status, &d.Distance, &d.ExpiresAt, &d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, err
		}
		dispatches = append(dispatches, &d)
	}
	return dispatches, nil
}

func (r *DispatchRepository) ExpireOld(ctx context.Context) (int64, error) {
	query := `UPDATE dispatches SET status = 'expired', updated_at = NOW() WHERE status = 'pending' AND expires_at <= NOW()`
	tag, err := r.pool.Exec(ctx, query)
	if err != nil {
		return 0, err
	}
	return tag.RowsAffected(), nil
}
