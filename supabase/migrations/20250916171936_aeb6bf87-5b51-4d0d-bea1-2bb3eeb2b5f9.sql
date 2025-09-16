-- Create n8n_configs table to store webhook configurations
CREATE TABLE public.n8n_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id TEXT NOT NULL,
  webhook_url TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  last_test_result TEXT CHECK (last_test_result IN ('success', 'error')),
  last_test_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(account_id)
);

-- Enable Row Level Security
ALTER TABLE public.n8n_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for n8n_configs
CREATE POLICY "Users can view their own n8n config" 
ON public.n8n_configs 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own n8n config" 
ON public.n8n_configs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own n8n config" 
ON public.n8n_configs 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_n8n_configs_updated_at
BEFORE UPDATE ON public.n8n_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();