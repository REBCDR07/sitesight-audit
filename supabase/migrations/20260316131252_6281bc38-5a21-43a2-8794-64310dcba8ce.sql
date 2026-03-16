
ALTER TABLE public.audit_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert audit results
CREATE POLICY "Anyone can insert audits" ON public.audit_history
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow anyone to read audit history
CREATE POLICY "Anyone can read audits" ON public.audit_history
  FOR SELECT TO anon, authenticated USING (true);
