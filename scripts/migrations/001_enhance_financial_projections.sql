-- Migration to enhance financial_projections table
DO $$ 
BEGIN
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'financial_projections' AND column_name = 'roi') THEN
        ALTER TABLE financial_projections ADD COLUMN roi DECIMAL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'financial_projections' AND column_name = 'payback_period') THEN
        ALTER TABLE financial_projections ADD COLUMN payback_period INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'financial_projections' AND column_name = 'monthly_cash_flows') THEN
        ALTER TABLE financial_projections ADD COLUMN monthly_cash_flows JSONB;
    END IF;

    -- Add new columns for enhanced metrics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'financial_projections' AND column_name = 'working_capital') THEN
        ALTER TABLE financial_projections ADD COLUMN working_capital DECIMAL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'financial_projections' AND column_name = 'sensitivity_analysis') THEN
        ALTER TABLE financial_projections ADD COLUMN sensitivity_analysis JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'financial_projections' AND column_name = 'scenario_analysis') THEN
        ALTER TABLE financial_projections ADD COLUMN scenario_analysis JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'financial_projections' AND column_name = 'cost_breakdown') THEN
        ALTER TABLE financial_projections ADD COLUMN cost_breakdown JSONB;
    END IF;

    -- Update existing records with calculated values
    UPDATE financial_projections
    SET 
        roi = ((projected_revenue - monthly_expenses) * 12 / NULLIF(startup_costs, 0) * 100),
        payback_period = CEIL(NULLIF(startup_costs, 0) / NULLIF(projected_revenue - monthly_expenses, 0)),
        monthly_cash_flows = (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'month', month,
                    'revenue', projected_revenue,
                    'expenses', monthly_expenses,
                    'profit', projected_revenue - monthly_expenses,
                    'cumulative_profit', (projected_revenue - monthly_expenses) * month
                )
            )
            FROM generate_series(1, 12) AS month
        ),
        working_capital = monthly_expenses * 3, -- 3 months of expenses as working capital
        sensitivity_analysis = jsonb_build_object(
            'revenue_variation', jsonb_build_array(
                jsonb_build_object('scenario', '10% decrease', 'impact', (projected_revenue * 0.9 - monthly_expenses) * 12),
                jsonb_build_object('scenario', '10% increase', 'impact', (projected_revenue * 1.1 - monthly_expenses) * 12)
            ),
            'expense_variation', jsonb_build_array(
                jsonb_build_object('scenario', '10% increase', 'impact', (projected_revenue - monthly_expenses * 1.1) * 12),
                jsonb_build_object('scenario', '10% decrease', 'impact', (projected_revenue - monthly_expenses * 0.9) * 12)
            )
        ),
        scenario_analysis = jsonb_build_object(
            'best_case', jsonb_build_object(
                'revenue', projected_revenue * 1.2,
                'expenses', monthly_expenses * 0.9,
                'profit', (projected_revenue * 1.2 - monthly_expenses * 0.9) * 12
            ),
            'worst_case', jsonb_build_object(
                'revenue', projected_revenue * 0.8,
                'expenses', monthly_expenses * 1.1,
                'profit', (projected_revenue * 0.8 - monthly_expenses * 1.1) * 12
            )
        ),
        cost_breakdown = jsonb_build_object(
            'fixed_costs', monthly_expenses * 0.6,
            'variable_costs', monthly_expenses * 0.4,
            'one_time_costs', startup_costs * 0.7,
            'operating_expenses', startup_costs * 0.3
        )
    WHERE roi IS NULL OR payback_period IS NULL OR monthly_cash_flows IS NULL;

END $$; 