-- Create table for AI market analysis
CREATE TABLE public.market_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  analysis_type TEXT NOT NULL, -- 'market_overview', 'price_prediction', 'trading_insights'
  ai_model TEXT NOT NULL, -- 'claude', 'gpt', 'perplexity'
  market_data JSONB NOT NULL,
  analysis_result JSONB NOT NULL,
  sentiment_score NUMERIC,
  price_prediction NUMERIC,
  confidence_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own analysis"
  ON public.market_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis"
  ON public.market_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analysis"
  ON public.market_analysis FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_market_analysis_user_id ON public.market_analysis(user_id);
CREATE INDEX idx_market_analysis_token_address ON public.market_analysis(token_address);
CREATE INDEX idx_market_analysis_created_at ON public.market_analysis(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_market_analysis_updated_at
  BEFORE UPDATE ON public.market_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();