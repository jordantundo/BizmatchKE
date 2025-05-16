-- Add new columns to business_ideas table
ALTER TABLE business_ideas
ADD COLUMN IF NOT EXISTS skills_required JSONB,
ADD COLUMN IF NOT EXISTS target_market TEXT,
ADD COLUMN IF NOT EXISTS potential_challenges JSONB,
ADD COLUMN IF NOT EXISTS success_factors JSONB,
ADD COLUMN IF NOT EXISTS market_trends JSONB,
ADD COLUMN IF NOT EXISTS success_rate_estimate TEXT,
ADD COLUMN IF NOT EXISTS estimated_roi TEXT,
ADD COLUMN IF NOT EXISTS economic_data JSONB;

-- Update existing records to have default values
UPDATE business_ideas
SET 
    skills_required = '[]'::jsonb,
    potential_challenges = '[]'::jsonb,
    success_factors = '[]'::jsonb,
    market_trends = '[]'::jsonb,
    economic_data = '{}'::jsonb
WHERE skills_required IS NULL; 