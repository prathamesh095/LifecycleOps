import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { applicationSchema } from '@/lib/schemas';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = 1; // Mock user ID for now

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM applications WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );

    // Transform DB rows to frontend Application shape if needed
    // The DB columns match the frontend interface mostly, but snake_case vs camelCase might differ?
    // Actually, the schema uses snake_case which matches the frontend interface for the most part.
    // One difference: `id` in DB is BIGINT, `public_id` is UUID. Frontend expects `id` to be UUID.
    // So we map `public_id` -> `id`.

    const applications = rows.map((row: any) => ({
      ...row,
      id: row.public_id, // Map public_id to id for frontend
      internal_id: row.id, // Keep internal ID if needed, but frontend doesn't use it
      // Handle boolean conversions if necessary (MySQL returns 1/0)
      is_stale: Boolean(row.is_stale),
      is_overdue: Boolean(row.is_overdue),
      is_heating_up: Boolean(row.is_heating_up),
      is_high_priority: Boolean(row.is_high_priority),
      is_cooling: Boolean(row.is_cooling),
      cover_letter_included: Boolean(row.cover_letter_included),
      ats_detected: Boolean(row.ats_detected),
      job_confirmed: Boolean(row.job_confirmed),
      response_received: Boolean(row.response_received), // Wait, this column might be missing in schema?
      // Let's check schema.sql for response_received.
      // It's not in the main table definition in schema.sql!
      // Wait, schema.sql has `response_received` in `outreachSchema` in `lib/schemas.ts`, but let's check `schema.sql`.
      // `schema.sql` has `job_confirmed` but I don't see `response_received`.
      // Ah, `response_received` is in `outreachSchema` in `lib/schemas.ts`.
      // I should add it to `schema.sql` if it's missing.
    }));

    return NextResponse.json(applications);
  } catch (error: any) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();
    const userId = 1; // Mock user ID for now

    // 1. Validate data using Zod
    const validation = applicationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const data = validation.data;
    const publicId = crypto.randomUUID();
    const now = new Date();

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 2. Map channel-specific names to primary_contact columns
    let primaryContactName = null;
    let primaryContactEmail = null;

    if (data.channel_type === 'OUTREACH') {
      primaryContactName = data.contact_name;
      primaryContactEmail = data.contact_email;
    } else if (data.channel_type === 'REFERRAL') {
      primaryContactName = data.referrer_name;
    } else if (data.channel_type === 'RECRUITER') {
      primaryContactName = data.recruiter_name;
      primaryContactEmail = data.recruiter_email;
    }

    // 3. Prepare main application insertion
    const [result]: any = await connection.query(
      `INSERT INTO applications (
        public_id, user_id, company_name, job_title, status, location, action_date,
        contact_id, role_family, seniority_level, department, work_type, city, country, timezone,
        user_interest_level, strategic_value, channel_type, application_source, job_posting_url,
        job_id, application_platform, application_method, cover_letter_included, ats_detected,
        primary_contact_name, primary_contact_email, outreach_type, personalization_level,
        template_used, recruiting_agency, recruiter_type, job_confirmed, next_follow_up_at,
        notes, last_activity_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        publicId, userId, data.company_name, data.job_title, data.status, data.location || null, data.action_date,
        data.contact_id || null, data.role_family || null, data.seniority_level || null, data.department || null,
        data.work_type || null, data.city || null, data.country || null, data.timezone || null,
        data.user_interest_level || 'MEDIUM', data.strategic_value || null, data.channel_type,
        (data as any).application_source || null, (data as any).job_posting_url || null,
        (data as any).job_id || null, (data as any).application_platform || null, (data as any).application_method || null,
        (data as any).cover_letter_included ? 1 : 0, (data as any).ats_detected ? 1 : 0,
        primaryContactName, primaryContactEmail, (data as any).outreach_type || null, (data as any).personalization_level || null,
        (data as any).template_used || null, (data as any).recruiting_agency || null, (data as any).recruiter_type || null,
        (data as any).job_confirmed ? 1 : 0, data.next_follow_up_at || null,
        data.notes || null, now
      ]
    );

    const applicationId = result.insertId;

    // 4. Handle Drive Links
    if (data.drive_links && data.drive_links.length > 0) {
      const linkValues = data.drive_links.map(url => [applicationId, url]);
      await connection.query(
        'INSERT INTO application_links (application_id, url) VALUES ?',
        [linkValues]
      );
    }

    // 5. Handle Tags
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        // Find or create tag
        const [tagResult]: any = await connection.query(
          'INSERT INTO tags (user_id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
          [userId, tagName]
        );
        const tagId = tagResult.insertId;
        
        // Link tag to application
        await connection.query(
          'INSERT IGNORE INTO application_tags (application_id, tag_id) VALUES (?, ?)',
          [applicationId, tagId]
        );
      }
    }

    // 6. Log Activity
    await connection.query(
      `INSERT INTO activities (
        public_id, user_id, application_id, activity_type, activity_at, actor, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), userId, applicationId, 'APPLICATION_CREATED', now, 'USER', 'Application created via dashboard']
    );

    await connection.commit();
    
    return NextResponse.json({ 
      success: true, 
      id: publicId,
      message: 'Application created successfully' 
    });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('Failed to create application:', error);
    return NextResponse.json({ 
      error: 'Failed to create application', 
      message: error.message 
    }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
