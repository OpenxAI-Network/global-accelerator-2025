-- Add columns for password reset functionality to the users table
ALTER TABLE users
ADD COLUMN password_reset_token VARCHAR(255),
ADD COLUMN password_reset_expires TIMESTAMP WITH TIME ZONE;
