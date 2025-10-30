ALTER TABLE users
ADD COLUMN bio TEXT,
ADD COLUMN phone VARCHAR(255),
ADD COLUMN avatar VARCHAR(255);

-- Down migration (for rollback)
/*
ALTER TABLE users
DROP COLUMN bio,
DROP COLUMN phone,
DROP COLUMN avatar;
*/
