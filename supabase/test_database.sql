-- Quick Database Test Script
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'resumes', 'analyses', 'resume_versions', 'job_recommendations');

-- 2. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'resumes', 'analyses');

-- 3. Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'resumes', 'analyses')
ORDER BY tablename, policyname;

-- 4. Check if any data exists
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'resumes', COUNT(*) FROM resumes
UNION ALL
SELECT 'analyses', COUNT(*) FROM analyses;

-- 5. Test insert (will fail if RLS is blocking)
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- Get your user ID first:
SELECT id, email FROM auth.users LIMIT 5;

-- Then test insert (uncomment and replace YOUR_USER_ID):
-- INSERT INTO profiles (id, email, full_name) 
-- VALUES ('YOUR_USER_ID', 'test@example.com', 'Test User')
-- ON CONFLICT (id) DO NOTHING;
