-- User Status Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('ACTIVE', 'LOCKED', 'SUSPENDED');
    END IF;
END $$;

-- Account Status Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED');
    END IF;
END $$;

-- Transaction Status Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REVERSED');
    END IF;
END $$;

-- Transaction Type Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('INTERNAL', 'EXTERNAL', 'BILL_PAYMENT');
    END IF;
END $$;

-- Loan Status Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loan_status') THEN
        CREATE TYPE loan_status AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
    END IF;
END $$;

-- Card Status Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'card_status') THEN
        CREATE TYPE card_status AS ENUM ('ACTIVE', 'FROZEN', 'BLOCKED', 'EXPIRED');
    END IF;
END $$;

-- Notification Type Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('EMAIL', 'SMS', 'PUSH');
    END IF;
END $$;
