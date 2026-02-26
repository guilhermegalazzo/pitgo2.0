-- Pitgo Initial Schema

-- Identity
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id    VARCHAR(255) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    role        VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(20) NOT NULL CHECK (type IN ('customer', 'provider')),
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(20) NOT NULL,
    avatar_url  TEXT,
    bio         TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_type ON profiles(type);

-- Provider Details
CREATE TABLE IF NOT EXISTS provider_details (
    profile_id    UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    categories    TEXT[] NOT NULL DEFAULT '{}',
    service_area  DECIMAL(10,2) NOT NULL DEFAULT 10.0,
    latitude      DECIMAL(10,7) NOT NULL DEFAULT 0,
    longitude     DECIMAL(10,7) NOT NULL DEFAULT 0,
    rating        DECIMAL(3,2) NOT NULL DEFAULT 0,
    total_jobs    INTEGER NOT NULL DEFAULT 0,
    is_verified   BOOLEAN NOT NULL DEFAULT FALSE
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    label       VARCHAR(50) NOT NULL,
    street      VARCHAR(255) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(50) NOT NULL,
    zip_code    VARCHAR(20) NOT NULL,
    latitude    DECIMAL(10,7) NOT NULL,
    longitude   DECIMAL(10,7) NOT NULL,
    is_default  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_addresses_profile_id ON addresses(profile_id);

-- Catalog: Categories
CREATE TABLE IF NOT EXISTS categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url    TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catalog: Services
CREATE TABLE IF NOT EXISTS services (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id    UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name           VARCHAR(200) NOT NULL,
    slug           VARCHAR(200) UNIQUE NOT NULL,
    description    TEXT,
    base_price     BIGINT NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    image_url      TEXT,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order     INTEGER NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_category_id ON services(category_id);

-- Price Modifiers
CREATE TABLE IF NOT EXISTS price_modifiers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    value       VARCHAR(100) NOT NULL,
    price_delta BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_price_modifiers_service_id ON price_modifiers(service_id);

-- Service Requests (Orders)
CREATE TABLE IF NOT EXISTS service_requests (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id  UUID NOT NULL REFERENCES profiles(id),
    provider_id  UUID REFERENCES profiles(id),
    service_id   UUID NOT NULL REFERENCES services(id),
    status       VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    total_price  BIGINT NOT NULL DEFAULT 0,
    notes        TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    address_id   UUID REFERENCES addresses(id),
    latitude     DECIMAL(10,7) NOT NULL,
    longitude    DECIMAL(10,7) NOT NULL,
    accepted_at  TIMESTAMPTZ,
    started_at   TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_customer ON service_requests(customer_id, status);
CREATE INDEX idx_requests_provider ON service_requests(provider_id, status);
CREATE INDEX idx_requests_status ON service_requests(status);

-- Request Items
CREATE TABLE IF NOT EXISTS request_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id      UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    service_id      UUID NOT NULL REFERENCES services(id),
    service_name    VARCHAR(200) NOT NULL,
    quantity        INTEGER NOT NULL DEFAULT 1,
    unit_price      BIGINT NOT NULL DEFAULT 0,
    total_price     BIGINT NOT NULL DEFAULT 0,
    price_modifiers TEXT[] DEFAULT '{}'
);

CREATE INDEX idx_request_items_request ON request_items(request_id);

-- Dispatches
CREATE TABLE IF NOT EXISTS dispatches (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id  UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES profiles(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'sent', 'accepted', 'rejected', 'expired')),
    distance_km DECIMAL(10,2) NOT NULL DEFAULT 0,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dispatches_request ON dispatches(request_id);
CREATE INDEX idx_dispatches_provider ON dispatches(provider_id, status);
