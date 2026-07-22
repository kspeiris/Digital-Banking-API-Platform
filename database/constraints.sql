-- 1. Users Constraints
ALTER TABLE users
ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT;

-- 2. Customers Constraints
ALTER TABLE customers
ADD CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Accounts Constraints
ALTER TABLE accounts
ADD CONSTRAINT fk_accounts_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
ADD CONSTRAINT chk_account_balance CHECK (balance >= 0),
ADD CONSTRAINT chk_account_available_balance CHECK (available_balance >= 0);

-- 4. Beneficiaries Constraints
ALTER TABLE beneficiaries
ADD CONSTRAINT fk_beneficiaries_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- 5. Transactions Constraints
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_from FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_transactions_to FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_transactions_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE SET NULL,
ADD CONSTRAINT chk_transaction_amount CHECK (amount > 0),
ADD CONSTRAINT chk_transaction_fee CHECK (fee >= 0);

-- 6. Scheduled Transfers Constraints
ALTER TABLE scheduled_transfers
ADD CONSTRAINT fk_scheduled_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_scheduled_from FOREIGN KEY (from_account) REFERENCES accounts(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_scheduled_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE,
ADD CONSTRAINT chk_scheduled_amount CHECK (amount > 0);

-- 7. Cards Constraints
ALTER TABLE cards
ADD CONSTRAINT fk_cards_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

-- 8. Card Limits Constraints
ALTER TABLE card_limits
ADD CONSTRAINT fk_limits_card FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
ADD CONSTRAINT chk_card_daily_limit CHECK (daily_limit >= 0),
ADD CONSTRAINT chk_card_atm_limit CHECK (atm_limit >= 0),
ADD CONSTRAINT chk_card_online_limit CHECK (online_limit >= 0),
ADD CONSTRAINT chk_card_contactless_limit CHECK (contactless_limit >= 0);

-- 9. Loans Constraints
ALTER TABLE loans
ADD CONSTRAINT fk_loans_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
ADD CONSTRAINT chk_loan_requested CHECK (requested_amount > 0),
ADD CONSTRAINT chk_loan_approved CHECK (approved_amount >= 0),
ADD CONSTRAINT chk_loan_interest CHECK (interest_rate >= 0),
ADD CONSTRAINT chk_loan_emi CHECK (emi >= 0);

-- 10. Loan Documents Constraints
ALTER TABLE loan_documents
ADD CONSTRAINT fk_documents_loan FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE;

-- 11. Notifications Constraints
ALTER TABLE notifications
ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 12. Audit Logs Constraints
ALTER TABLE audit_logs
ADD CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 13. API Keys Constraints
ALTER TABLE api_keys
ADD CONSTRAINT fk_apikeys_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
