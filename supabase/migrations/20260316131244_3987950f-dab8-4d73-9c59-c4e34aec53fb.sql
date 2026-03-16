
CREATE TABLE public.audit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  global_score int NOT NULL DEFAULT 0,
  mobile_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  desktop_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  mobile_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  desktop_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  dns_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  dimensions jsonb NOT NULL DEFAULT '[]'::jsonb
);

-- No RLS needed - public audit tool
ALTER TABLE public.audit_history DISABLE ROW LEVEL SECURITY;
