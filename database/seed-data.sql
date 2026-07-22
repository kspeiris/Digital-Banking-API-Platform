-- 1. Seed Roles
INSERT INTO roles (id, name, description) VALUES 
('a0000000-0000-0000-0000-000000000001', 'Admin', 'System Administrator with full access'),
('a0000000-0000-0000-0000-000000000002', 'Customer', 'Retail banking customer'),
('a0000000-0000-0000-0000-000000000003', 'Developer', 'API Developer portal user')
ON CONFLICT (name) DO NOTHING;

-- 2. Seed Admin User (Password is 'Admin@123' bcrypt hash or placeholder)
INSERT INTO users (id, role_id, email, password_hash, status, email_verified, updated_at) VALUES 
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'admin@bank.com', '$2b$12$HhSIsIyOLjQhRIRW75xxM.5gNBCRnR4sjVIHpYlcp94MmG3nsTidG', 'ACTIVE', TRUE, NOW())
ON CONFLICT (email) DO NOTHING;

-- 3. Seed Sample Customer User (Password is 'Customer123')
INSERT INTO users (id, role_id, email, password_hash, status, email_verified, updated_at) VALUES 
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'john.doe@gmail.com', '$2b$12$.O1lyGyyXQ/fUm6CNgeITeLO4s62ETnaoRiGVX72JYivgFkqd.1Fm', 'ACTIVE', TRUE, NOW())
ON CONFLICT (email) DO NOTHING;

-- 4. Seed Customer Profile
INSERT INTO customers (id, user_id, first_name, last_name, nic, dob, phone, address, city, country, occupation, kyc_status) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'John', 'Doe', '199512345678', '1995-05-12', '+94771234567', 'No 45, Flower Road', 'Colombo', 'Sri Lanka', 'Software Engineer', 'Verified')
ON CONFLICT (nic) DO NOTHING;

-- 5. Seed Customer Savings Account
INSERT INTO accounts (id, customer_id, account_number, account_type, currency, balance, available_balance, branch, status) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '100120030040', 'Savings', 'LKR', 250000.00, 250000.00, 'Colombo Main Branch', 'ACTIVE')
ON CONFLICT (account_number) DO NOTHING;

-- 6. Seed Sample Beneficiary
INSERT INTO beneficiaries (id, customer_id, nickname, bank_name, account_number, account_name, branch, favorite) VALUES
('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Jane Smith', 'Commercial Bank', '1002003004', 'Jane Smith', 'Kollupitiya', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Sample Transaction
INSERT INTO transactions (id, transaction_reference, from_account_id, to_account_id, beneficiary_id, transaction_type, amount, currency, description, status, fee) VALUES
('f0000000-0000-0000-0000-000000000001', 'TXN-9876543210', 'd0000000-0000-0000-0000-000000000001', NULL, 'e0000000-0000-0000-0000-000000000001', 'EXTERNAL', 25000.00, 'LKR', 'Payment to Jane Smith', 'SUCCESS', 15.00)
ON CONFLICT (transaction_reference) DO NOTHING;

-- 8. Seed Sample Card
INSERT INTO cards (id, account_id, card_number, card_type, expiry, cvv_hash, status, online_enabled, international_enabled) VALUES
('00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '4532718293847561', 'DEBIT', '12/29', '$2b$10$Uq1YhXhV98yAec1h0v3Ofe6vGz2g.rUq1v/h9l.jCgHqfXpGqfH1i', 'ACTIVE', TRUE, TRUE)
ON CONFLICT (card_number) DO NOTHING;

-- 9. Seed Card Limits
INSERT INTO card_limits (id, card_id, daily_limit, atm_limit, online_limit, contactless_limit) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 100000.00, 50000.00, 50000.00, 5000.00)
ON CONFLICT (card_id) DO NOTHING;
