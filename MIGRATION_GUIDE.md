# Migration Guide: Moving from KV Store to PostgreSQL

To support a larger volume of users and applications, we are migrating from a simple key-value store to structured PostgreSQL tables. This will allow for more complex queries, better data integrity, and scalability.

## 1. Create Database Tables

Execute the following SQL commands in your Supabase SQL Editor:

```sql
-- Create Loan Applications Table
CREATE TABLE IF NOT EXISTS loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    decided_at TIMESTAMPTZ,
    
    -- Archiving
    archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    original_status TEXT,
    
    -- Personal Details
    title TEXT,
    id_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    marital_status TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    next_of_kin JSONB,

    -- Work & Income
    employer_name TEXT NOT NULL,
    employer_address TEXT,
    employer_phone TEXT,
    next_pay_date TEXT, -- Storing as text to match existing format if applicable, or date
    payday_cycle TEXT,
    net_salary NUMERIC(15, 2) NOT NULL DEFAULT 0,
    monthly_expenses JSONB,

    -- Banking Details
    bank_name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    branch_code TEXT NOT NULL,
    account_number TEXT NOT NULL,

    -- Loan Details
    requested_amount NUMERIC(15, 2),
    approved_amount NUMERIC(15, 2),
    counter_offer_amount NUMERIC(15, 2),
    counter_offer_status TEXT CHECK (counter_offer_status IN ('pending', 'accepted', 'declined')),
    interest_rate NUMERIC(5, 2),
    fees NUMERIC(15, 2),
    total_due NUMERIC(15, 2),
    repayment_date TEXT, -- Storing as text or DATE

    -- Decisions
    decline_reason TEXT,
    admin_notes TEXT,
    assigned_to UUID,
    assigned_to_email TEXT,

    -- Verification Statuses
    credit_score NUMERIC,
    credit_check_passed BOOLEAN,
    credit_score_check JSONB,
    account_verification JSONB,
    identity_verification JSONB,
    credit_report JSONB,
    
    -- Document Flags
    has_id_document BOOLEAN DEFAULT FALSE,
    has_bank_statements BOOLEAN DEFAULT FALSE,
    has_proof_of_residence BOOLEAN DEFAULT FALSE,
    has_payslip BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loan_applications_id_number ON loan_applications(id_number);
CREATE INDEX idx_loan_applications_created_at ON loan_applications(created_at DESC);

-- Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_reference TEXT UNIQUE NOT NULL,
    application_id UUID REFERENCES loan_applications(id),
    amount NUMERIC(15, 2) NOT NULL,
    status TEXT NOT NULL, -- Complete, Error, Pending
    provider TEXT DEFAULT 'Ozow',
    metadata JSONB,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_application_id ON payments(application_id);
CREATE INDEX idx_payments_reference ON payments(transaction_reference);

-- Create Documents Table (Optional Metadata)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES loan_applications(id),
    user_id UUID REFERENCES auth.users(id),
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    verified BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_application_id ON documents(application_id);
```

## 2. Row Level Security (RLS) Policies

To secure access to these tables:

```sql
-- Enable RLS
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Users can insert their own applications
CREATE POLICY "Users can create their own applications" 
ON loan_applications FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own applications
CREATE POLICY "Users can view their own applications" 
ON loan_applications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can update their own DRAFT applications
CREATE POLICY "Users can update their own draft applications" 
ON loan_applications FOR UPDATE
TO authenticated 
USING (auth.uid() = user_id AND status = 'draft')
WITH CHECK (auth.uid() = user_id AND status = 'draft');

-- Service Role (Server Functions) has full access
-- Note: Service role bypasses RLS by default, but policies can be explicit if needed.
```
