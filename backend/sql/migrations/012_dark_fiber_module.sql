-- Dark Fiber Module - Database Migration
-- Creates tables for managing dark fiber networks, POPs, routes, customer rings, and customers

-- 1. Dark Fiber Networks (top-level container per city/operator)
CREATE TABLE IF NOT EXISTS dark_fiber_networks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  region VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  operator VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. POPs (Points of Presence)
CREATE TABLE IF NOT EXISTS dark_fiber_pops (
  id SERIAL PRIMARY KEY,
  network_id INTEGER REFERENCES dark_fiber_networks(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  pop_type VARCHAR(50) DEFAULT 'pop',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  building_name VARCHAR(255),
  floor_details VARCHAR(255),
  equipment_details JSONB DEFAULT '{}',
  icon_type VARCHAR(50) DEFAULT 'tower',
  icon_color VARCHAR(20) DEFAULT '#0EA5E9',
  icon_size INTEGER DEFAULT 32,
  status VARCHAR(50) DEFAULT 'active',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Fiber Routes (physical cable paths between POPs)
CREATE TABLE IF NOT EXISTS dark_fiber_routes (
  id SERIAL PRIMARY KEY,
  network_id INTEGER REFERENCES dark_fiber_networks(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  start_pop_id INTEGER REFERENCES dark_fiber_pops(id) ON DELETE SET NULL,
  end_pop_id INTEGER REFERENCES dark_fiber_pops(id) ON DELETE SET NULL,
  coordinates JSONB NOT NULL,
  total_length_km DOUBLE PRECISION DEFAULT 0,
  fiber_count INTEGER DEFAULT 12,
  fiber_type VARCHAR(50) DEFAULT 'single_mode',
  cable_type VARCHAR(100),
  line_color VARCHAR(20) DEFAULT '#EF4444',
  line_width DOUBLE PRECISION DEFAULT 2,
  line_opacity DOUBLE PRECISION DEFAULT 1,
  line_dash_pattern VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  installation_date DATE,
  metadata JSONB DEFAULT '{}',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Customer Rings (logical ring topologies)
CREATE TABLE IF NOT EXISTS dark_fiber_customer_rings (
  id SERIAL PRIMARY KEY,
  network_id INTEGER REFERENCES dark_fiber_networks(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  ring_type VARCHAR(50) DEFAULT 'customer',
  start_pop VARCHAR(255),
  end_pop VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  total_customers INTEGER DEFAULT 0,
  coordinates JSONB,
  line_color VARCHAR(20) DEFAULT '#3B82F6',
  line_width DOUBLE PRECISION DEFAULT 2,
  metadata JSONB DEFAULT '{}',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Customer Sites (end customers connected via dark fiber)
CREATE TABLE IF NOT EXISTS dark_fiber_customers (
  id SERIAL PRIMARY KEY,
  ring_id INTEGER REFERENCES dark_fiber_customer_rings(id) ON DELETE SET NULL,
  network_id INTEGER REFERENCES dark_fiber_networks(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_type VARCHAR(50) DEFAULT 'corporate',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  -- Enterprise fields
  circuit_id VARCHAR(100),
  billing_id VARCHAR(100),
  sla_type VARCHAR(50),
  sla_uptime_percent DOUBLE PRECISION,
  monthly_rental_inr DOUBLE PRECISION,
  bandwidth_mbps INTEGER,
  service_type VARCHAR(100),
  last_mile_type VARCHAR(100),
  last_mile_length_km DOUBLE PRECISION,
  olt_port VARCHAR(100),
  onu_serial VARCHAR(100),
  -- Contact
  contact_person VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  -- Contract
  contract_start DATE,
  contract_end DATE,
  -- Visual
  icon_type VARCHAR(50) DEFAULT 'building',
  icon_color VARCHAR(20) DEFAULT '#F59E0B',
  fiber_route JSONB,
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Import History
CREATE TABLE IF NOT EXISTS dark_fiber_imports (
  id SERIAL PRIMARY KEY,
  network_id INTEGER REFERENCES dark_fiber_networks(id) ON DELETE CASCADE,
  filename VARCHAR(255),
  file_type VARCHAR(20),
  file_size_bytes BIGINT,
  pops_imported INTEGER DEFAULT 0,
  routes_imported INTEGER DEFAULT 0,
  rings_imported INTEGER DEFAULT 0,
  customers_imported INTEGER DEFAULT 0,
  total_fiber_km DOUBLE PRECISION DEFAULT 0,
  status VARCHAR(50) DEFAULT 'completed',
  error_log TEXT,
  imported_by INTEGER REFERENCES users(id),
  imported_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dark_fiber_pops_network ON dark_fiber_pops(network_id);
CREATE INDEX IF NOT EXISTS idx_dark_fiber_routes_network ON dark_fiber_routes(network_id);
CREATE INDEX IF NOT EXISTS idx_dark_fiber_rings_network ON dark_fiber_customer_rings(network_id);
CREATE INDEX IF NOT EXISTS idx_dark_fiber_customers_network ON dark_fiber_customers(network_id);
CREATE INDEX IF NOT EXISTS idx_dark_fiber_customers_ring ON dark_fiber_customers(ring_id);
CREATE INDEX IF NOT EXISTS idx_dark_fiber_pops_location ON dark_fiber_pops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_dark_fiber_customers_location ON dark_fiber_customers(latitude, longitude);
