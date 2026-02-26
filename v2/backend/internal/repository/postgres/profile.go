package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	domain "github.com/pitgo/backend/internal/domain/profile"
)

type ProfileRepository struct {
	pool *pgxpool.Pool
}

func NewProfileRepository(pool *pgxpool.Pool) *ProfileRepository {
	return &ProfileRepository{pool: pool}
}

func (r *ProfileRepository) Create(ctx context.Context, p *domain.Profile) error {
	query := `INSERT INTO profiles (id, user_id, type, first_name, last_name, phone, avatar_url, bio, is_active, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	_, err := r.pool.Exec(ctx, query, p.ID, p.UserID, p.Type, p.FirstName, p.LastName, p.Phone, p.AvatarURL, p.Bio, p.IsActive, p.CreatedAt, p.UpdatedAt)
	return err
}

func (r *ProfileRepository) GetByID(ctx context.Context, id string) (*domain.Profile, error) {
	query := `SELECT id, user_id, type, first_name, last_name, phone, avatar_url, bio, is_active, created_at, updated_at FROM profiles WHERE id = $1`
	var p domain.Profile
	err := r.pool.QueryRow(ctx, query, id).Scan(&p.ID, &p.UserID, &p.Type, &p.FirstName, &p.LastName, &p.Phone, &p.AvatarURL, &p.Bio, &p.IsActive, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProfileRepository) GetByUserID(ctx context.Context, userID string) (*domain.Profile, error) {
	query := `SELECT id, user_id, type, first_name, last_name, phone, avatar_url, bio, is_active, created_at, updated_at FROM profiles WHERE user_id = $1`
	var p domain.Profile
	err := r.pool.QueryRow(ctx, query, userID).Scan(&p.ID, &p.UserID, &p.Type, &p.FirstName, &p.LastName, &p.Phone, &p.AvatarURL, &p.Bio, &p.IsActive, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProfileRepository) Update(ctx context.Context, p *domain.Profile) error {
	query := `UPDATE profiles SET first_name = $2, last_name = $3, phone = $4, avatar_url = $5, bio = $6, is_active = $7, updated_at = $8 WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, p.ID, p.FirstName, p.LastName, p.Phone, p.AvatarURL, p.Bio, p.IsActive, p.UpdatedAt)
	return err
}

func (r *ProfileRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM profiles WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}

func (r *ProfileRepository) List(ctx context.Context, profileType domain.ProfileType, limit, offset int) ([]*domain.Profile, error) {
	query := `SELECT id, user_id, type, first_name, last_name, phone, avatar_url, bio, is_active, created_at, updated_at FROM profiles WHERE type = $1 LIMIT $2 OFFSET $3`
	rows, err := r.pool.Query(ctx, query, profileType, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var profiles []*domain.Profile
	for rows.Next() {
		var p domain.Profile
		if err := rows.Scan(&p.ID, &p.UserID, &p.Type, &p.FirstName, &p.LastName, &p.Phone, &p.AvatarURL, &p.Bio, &p.IsActive, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		profiles = append(profiles, &p)
	}
	return profiles, nil
}

func (r *ProfileRepository) CreateProviderDetails(ctx context.Context, d *domain.ProviderDetails) error {
	query := `INSERT INTO provider_details (profile_id, category, service_radius_km, latitude, longitude, rating, total_jobs, is_verified)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
    // Note: categories is []string in entity, but let's assume one category for now or joinTable
	// To be truly clean, we'd need a mapping but keeping it simple as per initial requirements.
	category := ""
	if len(d.Categories) > 0 {
		category = d.Categories[0]
	}
	_, err := r.pool.Exec(ctx, query, d.ProfileID, category, d.ServiceArea, d.Latitude, d.Longitude, d.Rating, d.TotalJobs, d.IsVerified)
	return err
}

func (r *ProfileRepository) GetProviderDetails(ctx context.Context, profileID string) (*domain.ProviderDetails, error) {
	query := `SELECT profile_id, category, service_radius_km, latitude, longitude, rating, total_jobs, is_verified FROM provider_details WHERE profile_id = $1`
	var d domain.ProviderDetails
	var category string
	err := r.pool.QueryRow(ctx, query, profileID).Scan(&d.ProfileID, &category, &d.ServiceArea, &d.Latitude, &d.Longitude, &d.Rating, &d.TotalJobs, &d.IsVerified)
	if err != nil {
		return nil, err
	}
	d.Categories = []string{category}
	return &d, nil
}

func (r *ProfileRepository) UpdateProviderDetails(ctx context.Context, d *domain.ProviderDetails) error {
	query := `UPDATE provider_details SET category = $2, service_radius_km = $3, latitude = $4, longitude = $5, rating = $6, total_jobs = $7, is_verified = $8 WHERE profile_id = $1`
	category := ""
	if len(d.Categories) > 0 {
		category = d.Categories[0]
	}
	_, err := r.pool.Exec(ctx, query, d.ProfileID, category, d.ServiceArea, d.Latitude, d.Longitude, d.Rating, d.TotalJobs, d.IsVerified)
	return err
}

func (r *ProfileRepository) FindProvidersInRadius(ctx context.Context, lat, lng, radiusKm float64, category string) ([]*domain.ProviderDetails, error) {
    // Basic Haversine Implementation or Postgres PostGIS if available.
    // Assuming raw SQL with earth_distance or haversine for now.
	query := `SELECT profile_id, category, service_radius_km, latitude, longitude, rating, total_jobs, is_verified 
	          FROM provider_details 
	          WHERE category = $1 
	          AND (6371 * acos(cos(radians($2)) * cos(radians(latitude)) * cos(radians(longitude) - radians($3)) + sin(radians($2)) * sin(radians(latitude)))) <= $4`
	
	rows, err := r.pool.Query(ctx, query, category, lat, lng, radiusKm)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var providers []*domain.ProviderDetails
	for rows.Next() {
		var d domain.ProviderDetails
		var cat string
		if err := rows.Scan(&d.ProfileID, &cat, &d.ServiceArea, &d.Latitude, &d.Longitude, &d.Rating, &d.TotalJobs, &d.IsVerified); err != nil {
			return nil, err
		}
		d.Categories = []string{cat}
		providers = append(providers, &d)
	}
	return providers, nil
}

func (r *ProfileRepository) CreateAddress(ctx context.Context, a *domain.Address) error {
	query := `INSERT INTO addresses (id, profile_id, label, street, city, state, zip_code, latitude, longitude, is_default)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
	_, err := r.pool.Exec(ctx, query, a.ID, a.ProfileID, a.Label, a.Street, a.City, a.State, a.ZipCode, a.Latitude, a.Longitude, a.IsDefault)
	return err
}

func (r *ProfileRepository) GetAddresses(ctx context.Context, profileID string) ([]*domain.Address, error) {
	query := `SELECT id, profile_id, label, street, city, state, zip_code, latitude, longitude, is_default FROM addresses WHERE profile_id = $1`
	rows, err := r.pool.Query(ctx, query, profileID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var addresses []*domain.Address
	for rows.Next() {
		var a domain.Address
		if err := rows.Scan(&a.ID, &a.ProfileID, &a.Label, &a.Street, &a.City, &a.State, &a.ZipCode, &a.Latitude, &a.Longitude, &a.IsDefault); err != nil {
			return nil, err
		}
		addresses = append(addresses, &a)
	}
	return addresses, nil
}

func (r *ProfileRepository) UpdateAddress(ctx context.Context, a *domain.Address) error {
	query := `UPDATE addresses SET label = $2, street = $3, city = $4, state = $5, zip_code = $6, latitude = $7, longitude = $8, is_default = $9 WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, a.ID, a.Label, a.Street, a.City, a.State, a.ZipCode, a.Latitude, a.Longitude, a.IsDefault)
	return err
}

func (r *ProfileRepository) DeleteAddress(ctx context.Context, id string) error {
	query := `DELETE FROM addresses WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
