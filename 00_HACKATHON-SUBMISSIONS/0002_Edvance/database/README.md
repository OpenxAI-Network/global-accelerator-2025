# Edvance Database Seed Data

This directory contains the database schema and seed data for the Edvance AI Discussion Forum application.

## Files

- `init.sql` - Complete database schema and seed data
- `seed.sql` - Standalone seed data file (for re-seeding existing databases)

## What's Included

The seed data includes:

### Users (13 total)
- **Teachers (5):**
  - Dr. Sarah Chen (teacher@university.edu) - Password: Chen102!
  - Prof. Michael Rodriguez (prof.rodriguez@university.edu)
  - Dr. Emily Watson (dr.watson@university.edu)
  - Prof. David Kim (prof.kim@university.edu)
  - Demo Teacher (demo.teacher@edvance.edu) - Password: Chen102!

- **Students (8):**
  - Alice Student (student@university.edu) - Password: Alice102!
  - Geebs Nunii (gnunii@university.edu)
  - Jane Smith (jane.smith@education.edu.au)
  - John Doe (john.doe@university.edu.au)
  - Henry Doe (henry.doe@university.edu.au)
  - Henry Li (henry.li@university.edu.au)
  - ddd (dddd@dddd)
  - henry wang (henry.wang@university.edu.au)

### Classes (5 total)
- **FINC3012** - Derivative Securities (Dr. Sarah Chen)
- **AMME2000** - Engineering Analysis (Prof. Michael Rodriguez)
- **BUSS1000** - Future of Business (Dr. Emily Watson)
- **ENGG1810** - Introduction to Engineering Computing (Prof. David Kim)
- **FINC3017** - Investment and Portfolio Management (Dr. Sarah Chen)

### Questions (18 total)
Questions covering various topics including:
- Programming concepts (recursion, loops, arrays)
- Financial derivatives (futures, forwards, options)
- Engineering mathematics (ODEs, matrix algebra)
- Portfolio management (CAPM, efficient portfolios)

### Answers (4 total)
Detailed answers to programming and mathematics questions

### Class Enrollments (7 total)
Students enrolled in various classes

### Votes (3 total)
Upvotes on questions

## How to Use

### For New Installations
The `init.sql` file will create the complete database schema and populate it with all the seed data.

### For Existing Databases
Use the `seed.sql` file to add the seed data to an existing database:

```bash
# Connect to your database and run:
psql -U your_username -d your_database -f seed.sql
```

### Docker Setup
If using Docker, the database will be automatically initialized with the seed data when the container starts.

## Demo Accounts

For testing purposes, use these accounts:

**Teacher Account:**
- Email: teacher@university.edu
- Password: Chen102!

**Student Account:**
- Email: student@university.edu
- Password: Alice102!

## Notes

- All passwords are hashed in the actual database
- The seed data represents a realistic academic discussion forum
- Questions span multiple academic disciplines
- The data includes both answered and unanswered questions
- Class enrollments show realistic student-teacher relationships
