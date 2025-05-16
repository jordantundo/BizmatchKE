-- Add new columns to financial_projections table
ALTER TABLE financial_projections
ADD COLUMN IF NOT EXISTS working_capital DECIMAL,
ADD COLUMN IF NOT EXISTS sensitivity_analysis JSONB,
ADD COLUMN IF NOT EXISTS scenario_analysis JSONB,
ADD COLUMN IF NOT EXISTS cost_breakdown JSONB,
ADD COLUMN IF NOT EXISTS growth_rate DECIMAL,
ADD COLUMN IF NOT EXISTS fixed_costs_percentage DECIMAL,
ADD COLUMN IF NOT EXISTS variable_costs_percentage DECIMAL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_financial_projections_working_capital ON financial_projections(working_capital);
CREATE INDEX IF NOT EXISTS idx_financial_projections_growth_rate ON financial_projections(growth_rate); 