package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	domain "github.com/pitgo/backend/internal/domain/catalog"
)

type CatalogRepository struct {
	pool *pgxpool.Pool
}

func NewCatalogRepository(pool *pgxpool.Pool) *CatalogRepository {
	return &CatalogRepository{pool: pool}
}

func (r *CatalogRepository) CreateCategory(ctx context.Context, c *domain.Category) error {
	query := `INSERT INTO categories (id, name, slug, description, icon_url, is_active, sort_order, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := r.pool.Exec(ctx, query, c.ID, c.Name, c.Slug, c.Description, c.IconURL, c.IsActive, c.SortOrder, c.CreatedAt, c.UpdatedAt)
	return err
}

func (r *CatalogRepository) GetCategoryByID(ctx context.Context, id string) (*domain.Category, error) {
	query := `SELECT id, name, slug, description, icon_url, is_active, sort_order, created_at, updated_at FROM categories WHERE id = $1`
	var c domain.Category
	err := r.pool.QueryRow(ctx, query, id).Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.IconURL, &c.IsActive, &c.SortOrder, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CatalogRepository) GetCategoryBySlug(ctx context.Context, slug string) (*domain.Category, error) {
	query := `SELECT id, name, slug, description, icon_url, is_active, sort_order, created_at, updated_at FROM categories WHERE slug = $1`
	var c domain.Category
	err := r.pool.QueryRow(ctx, query, slug).Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.IconURL, &c.IsActive, &c.SortOrder, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CatalogRepository) ListCategories(ctx context.Context, activeOnly bool) ([]*domain.Category, error) {
	query := `SELECT id, name, slug, description, icon_url, is_active, sort_order, created_at, updated_at FROM categories`
	if activeOnly {
		query += " WHERE is_active = true"
	}
	query += " ORDER BY sort_order ASC"

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []*domain.Category
	for rows.Next() {
		var c domain.Category
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.IconURL, &c.IsActive, &c.SortOrder, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		categories = append(categories, &c)
	}
	return categories, nil
}

func (r *CatalogRepository) UpdateCategory(ctx context.Context, c *domain.Category) error {
	query := `UPDATE categories SET name = $2, slug = $3, description = $4, icon_url = $5, is_active = $6, sort_order = $7, updated_at = $8 WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, c.ID, c.Name, c.Slug, c.Description, c.IconURL, c.IsActive, c.SortOrder, c.UpdatedAt)
	return err
}

func (r *CatalogRepository) DeleteCategory(ctx context.Context, id string) error {
	query := `DELETE FROM categories WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}

// Services

func (r *CatalogRepository) CreateService(ctx context.Context, s *domain.Service) error {
	query := `INSERT INTO services (id, category_id, name, slug, description, base_price, duration_minutes, image_url, is_active, sort_order, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`
	_, err := r.pool.Exec(ctx, query, s.ID, s.CategoryID, s.Name, s.Slug, s.Description, s.BasePrice, s.Duration, s.ImageURL, s.IsActive, s.SortOrder, s.CreatedAt, s.UpdatedAt)
	return err
}

func (r *CatalogRepository) GetServiceByID(ctx context.Context, id string) (*domain.Service, error) {
	query := `SELECT id, category_id, name, slug, description, base_price, duration_minutes, image_url, is_active, sort_order, created_at, updated_at FROM services WHERE id = $1`
	var s domain.Service
	err := r.pool.QueryRow(ctx, query, id).Scan(&s.ID, &s.CategoryID, &s.Name, &s.Slug, &s.Description, &s.BasePrice, &s.Duration, &s.ImageURL, &s.IsActive, &s.SortOrder, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *CatalogRepository) GetServiceBySlug(ctx context.Context, slug string) (*domain.Service, error) {
	query := `SELECT id, category_id, name, slug, description, base_price, duration_minutes, image_url, is_active, sort_order, created_at, updated_at FROM services WHERE slug = $1`
	var s domain.Service
	err := r.pool.QueryRow(ctx, query, slug).Scan(&s.ID, &s.CategoryID, &s.Name, &s.Slug, &s.Description, &s.BasePrice, &s.Duration, &s.ImageURL, &s.IsActive, &s.SortOrder, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *CatalogRepository) ListServices(ctx context.Context, categoryID string, activeOnly bool) ([]*domain.Service, error) {
	query := `SELECT id, category_id, name, slug, description, base_price, duration_minutes, image_url, is_active, sort_order, created_at, updated_at FROM services WHERE category_id = $1`
	if activeOnly {
		query += " AND is_active = true"
	}
	query += " ORDER BY sort_order ASC"

	rows, err := r.pool.Query(ctx, query, categoryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var services []*domain.Service
	for rows.Next() {
		var s domain.Service
		if err := rows.Scan(&s.ID, &s.CategoryID, &s.Name, &s.Slug, &s.Description, &s.BasePrice, &s.Duration, &s.ImageURL, &s.IsActive, &s.SortOrder, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		services = append(services, &s)
	}
	return services, nil
}

func (r *CatalogRepository) UpdateService(ctx context.Context, s *domain.Service) error {
	query := `UPDATE services SET category_id = $2, name = $3, slug = $4, description = $5, base_price = $6, duration_minutes = $7, image_url = $8, is_active = $9, sort_order = $10, updated_at = $11 WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, s.ID, s.CategoryID, s.Name, s.Slug, s.Description, s.BasePrice, s.Duration, s.ImageURL, s.IsActive, s.SortOrder, s.UpdatedAt)
	return err
}

func (r *CatalogRepository) DeleteService(ctx context.Context, id string) error {
	query := `DELETE FROM services WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}

// Price Modifiers

func (r *CatalogRepository) CreatePriceModifier(ctx context.Context, m *domain.PriceModifier) error {
	query := `INSERT INTO price_modifiers (id, service_id, name, value, price_delta) VALUES ($1, $2, $3, $4, $5)`
	_, err := r.pool.Exec(ctx, query, m.ID, m.ServiceID, m.Name, m.Value, m.PriceDelta)
	return err
}

func (r *CatalogRepository) GetPriceModifiers(ctx context.Context, serviceID string) ([]*domain.PriceModifier, error) {
	query := `SELECT id, service_id, name, value, price_delta FROM price_modifiers WHERE service_id = $1`
	rows, err := r.pool.Query(ctx, query, serviceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var modifiers []*domain.PriceModifier
	for rows.Next() {
		var m domain.PriceModifier
		if err := rows.Scan(&m.ID, &m.ServiceID, &m.Name, &m.Value, &m.PriceDelta); err != nil {
			return nil, err
		}
		modifiers = append(modifiers, &m)
	}
	return modifiers, nil
}

func (r *CatalogRepository) DeletePriceModifier(ctx context.Context, id string) error {
	query := `DELETE FROM price_modifiers WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
