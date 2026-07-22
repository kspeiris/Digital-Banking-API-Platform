-- Users Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Customers Indexes
CREATE INDEX IF NOT EXISTS idx_customers_nic ON customers(nic);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- Accounts Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_accounts_customer_id ON accounts(customer_id);

-- Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_from_acc ON transactions(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_acc ON transactions(to_account_id);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Cards Indexes
CREATE INDEX IF NOT EXISTS idx_cards_card_number ON cards(card_number);
CREATE INDEX IF NOT EXISTS idx_cards_account_id ON cards(account_id);

-- Loans Indexes
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON loans(customer_id);

-- API Keys Indexes
CREATE INDEX IF NOT EXISTS idx_apikeys_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_apikeys_user_id ON api_keys(user_id);
