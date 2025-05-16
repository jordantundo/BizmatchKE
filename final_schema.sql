-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create business_ideas table
CREATE TABLE business_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    industry TEXT NOT NULL,
    investment_min INTEGER NOT NULL DEFAULT 0,
    investment_max INTEGER NOT NULL DEFAULT 0,
    location TEXT NOT NULL,
    skills_required JSONB,
    target_market TEXT,
    potential_challenges JSONB,
    success_factors JSONB,
    market_trends JSONB,
    success_rate_estimate TEXT,
    estimated_roi TEXT,
    economic_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create financial_projections table
CREATE TABLE financial_projections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    idea_id UUID NOT NULL REFERENCES business_ideas(id) ON DELETE CASCADE,
    startup_costs INTEGER NOT NULL,
    monthly_expenses INTEGER NOT NULL,
    projected_revenue INTEGER NOT NULL,
    break_even_months INTEGER NOT NULL,
    roi DECIMAL,
    payback_period INTEGER,
    monthly_cash_flows JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX business_ideas_user_id_idx ON business_ideas(user_id);
CREATE INDEX financial_projections_user_id_idx ON financial_projections(user_id);
CREATE INDEX financial_projections_idea_id_idx ON financial_projections(idea_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_ideas_updated_at
    BEFORE UPDATE ON business_ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_projections_updated_at
    BEFORE UPDATE ON financial_projections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();