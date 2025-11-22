-- Add new columns to bill_analyses table for enhanced analysis data

ALTER TABLE bill_analyses 
ADD COLUMN IF NOT EXISTS monthly_usage JSONB,
ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
ADD COLUMN IF NOT EXISTS action_plan JSONB,
ADD COLUMN IF NOT EXISTS next_month_forecast NUMERIC;

-- Comment on columns for clarity
COMMENT ON COLUMN bill_analyses.monthly_usage IS 'Array of monthly usage data (month, usage, temp)';
COMMENT ON COLUMN bill_analyses.ai_analysis IS 'Array of AI root cause analysis items';
COMMENT ON COLUMN bill_analyses.action_plan IS 'Array of recommended action plans';
COMMENT ON COLUMN bill_analyses.next_month_forecast IS 'Estimated bill amount for the next month';

