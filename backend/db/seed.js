require('dotenv').config({ path: '../.env' });
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding demo data...\n');

    const ownerPwd   = await bcrypt.hash('demo1234', 10);
    const proPwd     = await bcrypt.hash('demo1234', 10);

    // Demo Owner
    const ownerRes = await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Al-Khalifa Pharmacy', 'owner@demo.com', $1, 'owner')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [ownerPwd]);
    const ownerId = ownerRes.rows[0].id;

    await client.query(`
      INSERT INTO owner_profiles (user_id, business_name, city, services, about, is_verified)
      VALUES ($1, 'Al-Khalifa Pharmacy', 'Riyadh', ARRAY['Dispensing','Compounding','Consultation'], 
              'Leading community pharmacy in Riyadh since 2005.', true)
      ON CONFLICT (user_id) DO NOTHING
    `, [ownerId]);
    console.log('✅ Demo owner: owner@demo.com / demo1234');

    // Demo Professional
    const proRes = await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Dr. Sara Al-Hassan', 'pro@demo.com', $1, 'professional')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [proPwd]);
    const proId = proRes.rows[0].id;

    await client.query(`
      INSERT INTO professional_profiles (user_id, title, years_experience, specializations, work_types, city, bio, hourly_rate_min, hourly_rate_max, is_available, is_verified)
      VALUES ($1, 'Clinical Pharmacist', 6, ARRAY['Clinical Pharmacy','Community Pharmacy'], 
              ARRAY['full-time','part-time','locum'], 'Riyadh',
              'Experienced clinical pharmacist with 6+ years in community and hospital settings.',
              150, 200, true, true)
      ON CONFLICT (user_id) DO NOTHING
    `, [proId]);
    console.log('✅ Demo professional: pro@demo.com / demo1234');

    // Demo Jobs
    await client.query(`
      INSERT INTO jobs (owner_id, title, description, job_type, city, pay_min, pay_max, pay_type, specializations, experience_min, status)
      VALUES 
        ($1, 'Senior Clinical Pharmacist', 'We are looking for an experienced clinical pharmacist to join our team full-time. Responsibilities include patient counseling, medication review, and dispensing.', 'full-time', 'Riyadh', 12000, 16000, 'monthly', ARRAY['Clinical Pharmacy','Community Pharmacy'], 4, 'active'),
        ($1, 'Weekend Locum Pharmacist', 'Coverage needed for Friday and Saturday shifts. Community pharmacy experience required. Friendly team environment.', 'locum', 'Riyadh', 120, 180, 'hourly', ARRAY['Community Pharmacy'], 2, 'active'),
        ($1, 'Compounding Specialist', 'Part-time compounding pharmacist for our growing compounding department. Advanced compounding skills required.', 'part-time', 'Jeddah', 90, 130, 'hourly', ARRAY['Compounding'], 3, 'active')
      ON CONFLICT DO NOTHING
    `, [ownerId]);
    console.log('✅ Demo jobs created');

    console.log('\n🎉 Seed complete!');
    console.log('   Login: owner@demo.com / demo1234');
    console.log('   Login: pro@demo.com / demo1234\n');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
};

seed();
