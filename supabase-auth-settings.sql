-- Disable sign-ups for single-user application
-- This prevents new user registrations

-- Update auth settings to disable sign-ups
UPDATE auth.config 
SET enable_signup = false 
WHERE id = 1;

-- If the above doesn't work, you can also disable sign-ups via RLS policies
-- Create a policy that only allows the first user to access data
-- (This is a backup approach)

-- Note: The main approach is to simply not provide a sign-up UI
-- and only allow sign-in with existing credentials
