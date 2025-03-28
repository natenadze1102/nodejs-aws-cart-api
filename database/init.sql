-- Create enum type for cart status
CREATE TYPE cart_status AS ENUM ('OPEN', 'ORDERED');

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  status cart_status NOT NULL DEFAULT 'OPEN'
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (cart_id, product_id)
);

-- Create orders table (for optional task)
CREATE TYPE order_status AS ENUM ('OPEN', 'APPROVED', 'CONFIRMED', 'SENT', 'COMPLETED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cart_id UUID REFERENCES carts(id),
  payment JSONB,
  delivery JSONB,
  comments TEXT,
  status order_status NOT NULL DEFAULT 'OPEN',
  total NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create status_history table for orders (for additional tracking)
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  comment TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert test data
-- Test user IDs
INSERT INTO carts (id, user_id, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'OPEN'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'ORDERED');

-- Test cart items
INSERT INTO cart_items (cart_id, product_id, count)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 2),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 1),
  ('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 3);

-- Test order
INSERT INTO orders (id, user_id, cart_id, payment, delivery, comments, status, total)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  '00000000-0000-0000-0000-000000000002',
  '22222222-2222-2222-2222-222222222222',
  '{"method": "credit_card", "transaction_id": "txn_12345"}',
  '{"address": "123 Main St", "city": "New York", "zipcode": "10001"}',
  'Please deliver to the front desk',
  'APPROVED',
  129.99
);

-- Test status history
INSERT INTO status_history (order_id, status, comment)
VALUES 
  ('66666666-6666-6666-6666-666666666666', 'OPEN', 'Order created'),
  ('66666666-6666-6666-6666-666666666666', 'APPROVED', 'Payment successful');