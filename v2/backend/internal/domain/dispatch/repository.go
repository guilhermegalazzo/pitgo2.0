package dispatch

import "context"

type Repository interface {
	Create(ctx context.Context, d *Dispatch) error
	GetByID(ctx context.Context, id string) (*Dispatch, error)
	Update(ctx context.Context, d *Dispatch) error
	GetByRequestID(ctx context.Context, requestID string) ([]*Dispatch, error)
	GetPendingByProvider(ctx context.Context, providerID string) ([]*Dispatch, error)
	ExpireOld(ctx context.Context) (int64, error)
}
