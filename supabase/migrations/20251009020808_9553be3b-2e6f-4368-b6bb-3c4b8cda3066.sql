-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'developer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'privacy-team';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'planning-team';