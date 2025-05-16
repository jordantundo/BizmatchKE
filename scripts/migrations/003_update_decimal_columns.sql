-- Update financial_projections table columns to DECIMAL
ALTER TABLE financial_projections
    ALTER COLUMN startup_costs TYPE DECIMAL(12,2),
    ALTER COLUMN monthly_expenses TYPE DECIMAL(12,2),
    ALTER COLUMN projected_revenue TYPE DECIMAL(12,2),
    ALTER COLUMN working_capital TYPE DECIMAL(12,2),
    ALTER COLUMN roi TYPE DECIMAL(12,2);

-- Update business_ideas table columns to DECIMAL
ALTER TABLE business_ideas
    ALTER COLUMN investment_min TYPE DECIMAL(12,2),
    ALTER COLUMN investment_max TYPE DECIMAL(12,2); 