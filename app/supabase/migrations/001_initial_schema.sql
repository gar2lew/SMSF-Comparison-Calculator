-- Migration: 001_initial_schema.sql
-- SMSF Projection Workspace — Complete Database Schema
-- Run in Supabase SQL Editor or via `supabase db push`

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- TRIGGER FUNCTION: auto-update updated_at column
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGER FUNCTION: auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  INSERT INTO public.company_settings (adviser_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: log projection activity
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_projection_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_log (entity_type, entity_id, adviser_id, activity_type, description)
  VALUES (
    'projection',
    NEW.id,
    NEW.adviser_id,
    CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END,
    CASE WHEN TG_OP = 'INSERT' THEN 'Projection "' || NEW.name || '" created'
         ELSE 'Projection "' || NEW.name || '" updated' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_projection_activity ON public.projections;
CREATE TRIGGER trg_projection_activity
  AFTER INSERT OR UPDATE ON public.projections
  FOR EACH ROW EXECUTE FUNCTION public.log_projection_activity();

-- ============================================================
-- TABLE: profiles (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  firm_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TABLE: clients
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adviser_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  date_of_birth DATE,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'archived', 'lead')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_adviser ON public.clients(adviser_id);
CREATE INDEX IF NOT EXISTS idx_clients_status   ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm ON public.clients
  USING gin ((first_name || ' ' || last_name) gin_trgm_ops);

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TABLE: projections
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  adviser_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'active', 'archived')),
  shared        BOOLEAN NOT NULL DEFAULT false,
  presented     BOOLEAN NOT NULL DEFAULT false,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_projections_client  ON public.projections(client_id);
CREATE INDEX IF NOT EXISTS idx_projections_adviser ON public.projections(adviser_id);
CREATE INDEX IF NOT EXISTS idx_projections_status  ON public.projections(status);
CREATE INDEX IF NOT EXISTS idx_projections_date    ON public.projections(created_at DESC);

CREATE TRIGGER trg_projections_updated_at
  BEFORE UPDATE ON public.projections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TABLE: scenarios
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scenarios (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projection_id            UUID NOT NULL REFERENCES public.projections(id) ON DELETE CASCADE,
  display_order            SMALLINT NOT NULL DEFAULT 0,
  name                     TEXT NOT NULL,
  fund_type                TEXT NOT NULL DEFAULT 'current'
                             CHECK (fund_type IN ('current', 'smsf')),
  current_balance          NUMERIC(14,2) NOT NULL CHECK (current_balance > 0),
  salary                   NUMERIC(10,2) NOT NULL CHECK (salary > 0),
  employer_rate            NUMERIC(4,3) NOT NULL CHECK (employer_rate >= 0),
  growth_rate              NUMERIC(4,3) NOT NULL CHECK (growth_rate >= 0),
  projection_years         SMALLINT NOT NULL CHECK (projection_years BETWEEN 1 AND 40),
  salary_sacrifice_enabled BOOLEAN NOT NULL DEFAULT false,
  salary_sacrifice_percent NUMERIC(5,2) NOT NULL DEFAULT 0
                             CHECK (salary_sacrifice_percent BETWEEN 0 AND 100),
  status                   TEXT NOT NULL DEFAULT 'active'
                             CHECK (status IN ('active', 'archived')),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_projection ON public.scenarios(projection_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_order      ON public.scenarios(display_order);

CREATE TRIGGER trg_scenarios_updated_at
  BEFORE UPDATE ON public.scenarios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TABLE: notes (polymorphic)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('client', 'projection')),
  entity_id   UUID NOT NULL,
  adviser_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note_type   TEXT NOT NULL CHECK (note_type IN ('adviser', 'client', 'internal')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_entity   ON public.notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notes_adviser  ON public.notes(adviser_id);
CREATE INDEX IF NOT EXISTS idx_notes_date     ON public.notes(created_at DESC);

CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TABLE: activity_log (CRM timeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   TEXT NOT NULL CHECK (entity_type IN ('client', 'projection')),
  entity_id     UUID NOT NULL,
  adviser_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
                  'created', 'updated', 'shared', 'exported', 'presented',
                  'archived', 'duplicated', 'scenario_added', 'note_added'
                )),
  description   TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_entity  ON public.activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_adviser ON public.activity_log(adviser_id);
CREATE INDEX IF NOT EXISTS idx_activity_date    ON public.activity_log(created_at DESC);

-- ============================================================
-- TABLE: reports
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projection_id   UUID NOT NULL REFERENCES public.projections(id) ON DELETE CASCADE,
  adviser_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_type     TEXT NOT NULL CHECK (report_type IN (
                    'client_summary', 'projection', 'comparison', 'scenario'
                  )),
  file_path       TEXT,
  file_name       TEXT,
  file_size       BIGINT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'generating', 'generated', 'failed')),
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_projection ON public.reports(projection_id);
CREATE INDEX IF NOT EXISTS idx_reports_status     ON public.reports(status);

-- ============================================================
-- TABLE: company_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.company_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adviser_id      UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  firm_name       TEXT,
  logo_url        TEXT,
  primary_color   TEXT DEFAULT '#10b981',
  disclaimer_text TEXT DEFAULT 'This report is illustrative only and does not constitute financial advice. All figures are estimates and exclude tax, fees, insurance, and market volatility.',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_clients" ON public.clients
  FOR SELECT USING (adviser_id = auth.uid());
CREATE POLICY "insert_own_clients" ON public.clients
  FOR INSERT WITH CHECK (adviser_id = auth.uid());
CREATE POLICY "update_own_clients" ON public.clients
  FOR UPDATE USING (adviser_id = auth.uid());
CREATE POLICY "delete_own_clients" ON public.clients
  FOR DELETE USING (adviser_id = auth.uid());

-- Projections
ALTER TABLE public.projections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_projections" ON public.projections
  FOR SELECT USING (adviser_id = auth.uid());
CREATE POLICY "insert_own_projections" ON public.projections
  FOR INSERT WITH CHECK (adviser_id = auth.uid());
CREATE POLICY "update_own_projections" ON public.projections
  FOR UPDATE USING (adviser_id = auth.uid());
CREATE POLICY "delete_own_projections" ON public.projections
  FOR DELETE USING (adviser_id = auth.uid());

-- Scenarios (indirect: via projection -> adviser)
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_scenarios" ON public.scenarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projections p
      WHERE p.id = scenarios.projection_id AND p.adviser_id = auth.uid()
    )
  );
CREATE POLICY "insert_own_scenarios" ON public.scenarios
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projections p
      WHERE p.id = scenarios.projection_id AND p.adviser_id = auth.uid()
    )
  );
CREATE POLICY "update_own_scenarios" ON public.scenarios
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projections p
      WHERE p.id = scenarios.projection_id AND p.adviser_id = auth.uid()
    )
  );
CREATE POLICY "delete_own_scenarios" ON public.scenarios
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projections p
      WHERE p.id = scenarios.projection_id AND p.adviser_id = auth.uid()
    )
  );

-- Notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_notes" ON public.notes
  FOR SELECT USING (adviser_id = auth.uid());
CREATE POLICY "insert_own_notes" ON public.notes
  FOR INSERT WITH CHECK (
    adviser_id = auth.uid() AND (
      (entity_type = 'client' AND EXISTS (
        SELECT 1 FROM public.clients c WHERE c.id = notes.entity_id AND c.adviser_id = auth.uid()
      ))
      OR
      (entity_type = 'projection' AND EXISTS (
        SELECT 1 FROM public.projections p WHERE p.id = notes.entity_id AND p.adviser_id = auth.uid()
      ))
    )
  );

-- Activity Log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_activity" ON public.activity_log
  FOR SELECT USING (adviser_id = auth.uid());
CREATE POLICY "insert_own_activity" ON public.activity_log
  FOR INSERT WITH CHECK (adviser_id = auth.uid());

-- Reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_reports" ON public.reports
  FOR SELECT USING (adviser_id = auth.uid());
CREATE POLICY "insert_own_reports" ON public.reports
  FOR INSERT WITH CHECK (adviser_id = auth.uid());

-- Company Settings
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_settings" ON public.company_settings
  FOR SELECT USING (adviser_id = auth.uid());
CREATE POLICY "insert_own_settings" ON public.company_settings
  FOR INSERT WITH CHECK (adviser_id = auth.uid());
CREATE POLICY "update_own_settings" ON public.company_settings
  FOR UPDATE USING (adviser_id = auth.uid());

-- ============================================================
-- STORAGE BUCKET POLICIES
-- ============================================================
-- Run these separately in Supabase Storage SQL editor or via dashboard:
--
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', false);
--
-- CREATE POLICY "adviser_report_access" ON storage.objects
--   FOR ALL USING (
--     bucket_id = 'reports'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );
