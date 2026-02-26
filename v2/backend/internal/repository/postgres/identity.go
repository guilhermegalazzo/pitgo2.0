package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	domain "github.com/pitgo/backend/internal/domain/identity"
)

type IdentityRepository struct {
	pool *pgxpool.Pool
}

func NewIdentityRepository(pool *pgxpool.Pool) *IdentityRepository {
	return &IdentityRepository{pool: pool}
}

func (r *IdentityRepository) Create(ctx context.Context, u *domain.User) error {
	query := `INSERT INTO users (id, clerk_id, email, role, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.pool.Exec(ctx, query, u.ID, u.ClerkID, u.Email, u.Role, u.CreatedAt, u.UpdatedAt)
	return err
}

func (r *IdentityRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	query := `SELECT id, clerk_id, email, role, created_at, updated_at FROM users WHERE id = $1`
	var u domain.User
	err := r.pool.QueryRow(ctx, query, id).Scan(&u.ID, &u.ClerkID, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *IdentityRepository) GetByClerkID(ctx context.Context, clerkID string) (*domain.User, error) {
	query := `SELECT id, clerk_id, email, role, created_at, updated_at FROM users WHERE clerk_id = $1`
	var u domain.User
	err := r.pool.QueryRow(ctx, query, clerkID).Scan(&u.ID, &u.ClerkID, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *IdentityRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `SELECT id, clerk_id, email, role, created_at, updated_at FROM users WHERE email = $1`
	var u domain.User
	err := r.pool.QueryRow(ctx, query, email).Scan(&u.ID, &u.ClerkID, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *IdentityRepository) Update(ctx context.Context, u *domain.User) error {
	query := `UPDATE users SET email = $2, role = $3, updated_at = $4 WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, u.ID, u.Email, u.Role, u.UpdatedAt)
	return err
}

func (r *IdentityRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}

func (r *IdentityRepository) List(ctx context.Context, limit, offset int) ([]*domain.User, error) {
	query := `SELECT id, clerk_id, email, role, created_at, updated_at FROM users LIMIT $1 OFFSET $2`
	rows, err := r.pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*domain.User
	for rows.Next() {
		var u domain.User
		if err := rows.Scan(&u.ID, &u.ClerkID, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}
	return users, nil
}
