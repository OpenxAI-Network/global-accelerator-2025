-- Migration to create the otps table for storing one-time passwords

CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    flow VARCHAR(50) NOT NULL, -- e.g., 'SIGNUP', 'FORGOT_PASSWORD'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INT DEFAULT 0,
    used BOOLEAN DEFAULT FALSE
);

-- Add an index on email and flow for faster lookups
CREATE INDEX idx_otps_email_flow ON otps(email, flow);
