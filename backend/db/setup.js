require('dotenv').config({ path: '../.env' });
const { pool } = require('../config/db');

const setup = async () => {
  const client = await pool.connect();
  try {
    console.log('🔧 Setting up PostgreSQL database...\n');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(255) NOT NULL,
        email       VARCHAR(255) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(20) NOT NULL CHECK (role IN ('owner','professional')),
        phone       VARCHAR(50) DEFAULT '',
        is_active   BOOLEAN DEFAULT true,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ users table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS owner_profiles (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        business_name   VARCHAR(255) NOT NULL DEFAULT '',
        license_number  VARCHAR(100) DEFAULT '',
        city            VARCHAR(100) DEFAULT '',
        country         VARCHAR(100) DEFAULT 'Saudi Arabia',
        address         TEXT DEFAULT '',
        phone           VARCHAR(50) DEFAULT '',
        services        TEXT[] DEFAULT '{}',
        about           TEXT DEFAULT '',
        logo            VARCHAR(500) DEFAULT '',
        website         VARCHAR(500) DEFAULT '',
        is_verified     BOOLEAN DEFAULT false,
        rating          NUMERIC(3,1) DEFAULT 0,
        review_count    INTEGER DEFAULT 0,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ owner_profiles table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS professional_profiles (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id           UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        title             VARCHAR(100) DEFAULT '',
        years_experience  INTEGER DEFAULT 0,
        specializations   TEXT[] DEFAULT '{}',
        work_types        TEXT[] DEFAULT '{}',
        city              VARCHAR(100) DEFAULT '',
        country           VARCHAR(100) DEFAULT 'Saudi Arabia',
        max_radius_km     INTEGER DEFAULT 50,
        bio               TEXT DEFAULT '',
        resume_url        VARCHAR(500) DEFAULT '',
        license_number    VARCHAR(100) DEFAULT '',
        hourly_rate_min   NUMERIC(10,2) DEFAULT 0,
        hourly_rate_max   NUMERIC(10,2) DEFAULT 0,
        is_available      BOOLEAN DEFAULT true,
        is_verified       BOOLEAN DEFAULT false,
        rating            NUMERIC(3,1) DEFAULT 0,
        review_count      INTEGER DEFAULT 0,
        created_at        TIMESTAMPTZ DEFAULT NOW(),
        updated_at        TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ professional_profiles table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id          UUID REFERENCES users(id) ON DELETE CASCADE,
        title             VARCHAR(255) NOT NULL,
        description       TEXT NOT NULL,
        job_type          VARCHAR(20) NOT NULL CHECK (job_type IN ('full-time','part-time','freelance','locum')),
        city              VARCHAR(100) DEFAULT '',
        address           TEXT DEFAULT '',
        is_remote         BOOLEAN DEFAULT false,
        pay_min           NUMERIC(10,2) DEFAULT 0,
        pay_max           NUMERIC(10,2) DEFAULT 0,
        pay_type          VARCHAR(20) DEFAULT 'hourly' CHECK (pay_type IN ('hourly','monthly','fixed')),
        specializations   TEXT[] DEFAULT '{}',
        experience_min    INTEGER DEFAULT 0,
        openings          INTEGER DEFAULT 1,
        requirements      TEXT DEFAULT '',
        status            VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','paused','closed')),
        application_count INTEGER DEFAULT 0,
        created_at        TIMESTAMPTZ DEFAULT NOW(),
        updated_at        TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ jobs table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id      UUID REFERENCES jobs(id) ON DELETE CASCADE,
        applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
        cover_note  TEXT DEFAULT '',
        match_score INTEGER DEFAULT 0,
        status      VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','shortlisted','rejected','hired')),
        applied_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(job_id, applicant_id)
      );
    `);
    console.log('✅ applications table');

    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reviewer_id  UUID REFERENCES users(id) ON DELETE CASCADE,
        reviewee_id  UUID REFERENCES users(id) ON DELETE CASCADE,
        job_id       UUID REFERENCES jobs(id) ON DELETE SET NULL,
        rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        review_text  TEXT DEFAULT '',
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ reviews table');

    // Useful indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_jobs_owner     ON jobs(owner_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_jobs_status    ON jobs(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_apps_job       ON applications(job_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_apps_applicant ON applications(applicant_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);`);
    console.log('✅ Indexes created');

    console.log('\n🎉 Database setup complete!\n');
  } catch (err) {
    console.error('❌ Setup error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
};

setup();
