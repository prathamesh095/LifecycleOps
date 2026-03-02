import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Application, Contact, ApplicationActivity } from '@/lib/schemas';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Helper to map frontend application to DB columns
function mapApplicationToDb(app: Application, userId: number, contactId: number | null = null) {
  return [
    app.id, // public_id
    userId,
    app.company_name,
    app.job_title,
    app.status,
    app.location || null,
    app.action_date,
    contactId, // Resolved contact_id
    
    // Identity Layer
    app.role_family || null,
    app.seniority_level || null,
    app.department || null,
    app.work_type || null,
    app.city || null,
    app.country || null,
    app.timezone || null,
    
    // Intelligence
    app.fit_score || null,
    app.confidence_score || null,
    app.priority_score || 0,
    app.user_interest_level || 'MEDIUM',
    app.strategic_value || null,
    
    // Flags
    app.is_stale ? 1 : 0,
    app.is_overdue ? 1 : 0,
    app.is_heating_up ? 1 : 0,
    app.is_high_priority ? 1 : 0,
    app.is_cooling ? 1 : 0,
    
    // Channel Type
    app.channel_type,
    
    // Direct Apply
    app.application_source || null,
    app.job_posting_url || null,
    app.job_id || null,
    app.application_platform || null,
    app.application_method || null,
    app.cover_letter_included ? 1 : 0,
    app.ats_detected ? 1 : 0,
    
    // Outreach/Referral/Recruiter Shared
    app.contact_name || app.referrer_name || app.recruiter_name || null,
    app.contact_email || app.recruiter_email || null,
    
    // Outreach
    app.outreach_type || null,
    app.personalization_level || null,
    app.template_used || null,
    
    // Recruiter
    app.recruiting_agency || null,
    app.recruiter_type || null,
    app.job_confirmed ? 1 : 0,
    
    // Follow Up
    app.next_follow_up_at ? new Date(app.next_follow_up_at) : null,
    app.follow_up_status || 'NONE',
    app.follow_up_priority || 'MEDIUM',
    
    // Assets
    app.resume_file_url || null,
    app.notes || null,
    
    // Timestamps
    new Date(app.created_at),
    app.updated_at ? new Date(app.updated_at) : new Date(),
    app.last_activity_at ? new Date(app.last_activity_at) : null
  ];
}

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const lastSyncedAt = searchParams.get('lastSyncedAt');
    const userId = 1; // Mock user ID
    
    let appQuery = 'SELECT * FROM applications WHERE user_id = ?';
    let contactQuery = 'SELECT * FROM contacts WHERE user_id = ?';
    let activityQuery = 'SELECT * FROM activities WHERE user_id = ?';
    let reminderQuery = 'SELECT * FROM reminders WHERE user_id = ?';
    const params: any[] = [userId];

    if (lastSyncedAt) {
      appQuery += ' AND updated_at > ?';
      contactQuery += ' AND updated_at > ?';
      activityQuery += ' AND updated_at > ?';
      reminderQuery += ' AND updated_at > ?';
      params.push(new Date(lastSyncedAt));
    }

    // Add safety limits
    appQuery += ' ORDER BY updated_at DESC LIMIT 5000';
    contactQuery += ' ORDER BY updated_at DESC LIMIT 5000';
    activityQuery += ' ORDER BY updated_at DESC LIMIT 5000';
    reminderQuery += ' ORDER BY updated_at DESC LIMIT 5000';

    const [apps, contacts, activities, reminders] = await Promise.all([
      pool.query<RowDataPacket[]>(appQuery, params),
      pool.query<RowDataPacket[]>(contactQuery, params),
      pool.query<RowDataPacket[]>(activityQuery, params),
      pool.query<RowDataPacket[]>(reminderQuery, params)
    ]);

    const transformedApps = apps[0].map((row: any) => ({
      ...row,
      id: row.public_id,
      is_stale: Boolean(row.is_stale),
      is_overdue: Boolean(row.is_overdue),
      is_heating_up: Boolean(row.is_heating_up),
      is_high_priority: Boolean(row.is_high_priority),
      is_cooling: Boolean(row.is_cooling),
      cover_letter_included: Boolean(row.cover_letter_included),
      ats_detected: Boolean(row.ats_detected),
      job_confirmed: Boolean(row.job_confirmed),
    }));

    const transformedContacts = contacts[0].map((row: any) => ({
      ...row,
      id: row.public_id,
    }));

    const transformedActivities = activities[0].map((row: any) => ({
      ...row,
      id: row.public_id,
    }));

    const transformedReminders = reminders[0].map((row: any) => ({
      ...row,
      id: row.public_id,
      completed: Boolean(row.completed),
    }));

    console.log(`[Sync] Load completed in ${Date.now() - start}ms. Incremental: ${!!lastSyncedAt}`);
    
    return NextResponse.json({
      applications: transformedApps,
      contacts: transformedContacts,
      activities: transformedActivities,
      reminders: transformedReminders,
      serverTime: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Load failed:', error);
    return NextResponse.json({ error: 'Load failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applications, contacts, activities, reminders } = body as { 
      applications: Application[], 
      contacts: Contact[], 
      activities: ApplicationActivity[],
      reminders: Reminder[]
    };
    const start = Date.now();
    console.log(`[Sync] Started. Payload size: Apps=${applications?.length}, Contacts=${contacts?.length}, Activities=${activities?.length}`);

    // In a real app, we'd get the user ID from the session
    // For this sync endpoint, we'll assume a single user or pass user_id via header/body
    // Let's assume user_id = 1 for now (or create if not exists based on email)
    // This is a simplified migration logic.
    
    // 1. Ensure User Exists (Mock logic)
    const connection = await pool.getConnection();
    console.log(`[Sync] DB Connection acquired in ${Date.now() - start}ms`);
    
    // Helper for batching
    const chunkArray = <T>(arr: T[], size: number): T[][] => {
      return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
      );
    };
    const BATCH_SIZE = 500;

    try {
      await connection.beginTransaction();
      const txnStart = Date.now();
      
      // Mock User ID
      const userId = 1; 

      // 2. Sync Contacts
      if (contacts && contacts.length > 0) {
        const contactStart = Date.now();
        const contactChunks = chunkArray(contacts, BATCH_SIZE);
        
        for (const chunk of contactChunks) {
          const contactValues = chunk.map((c: Contact) => [
            c.id, // public_id
            userId,
            c.name,
            c.role,
            c.company,
            c.email || null,
            c.notes || null,
            c.relationship_strength || null,
            new Date(c.created_at),
            c.updated_at ? new Date(c.updated_at) : new Date()
          ]);

          const contactSql = `
            INSERT INTO contacts (
              public_id, user_id, name, role, company, email, notes, relationship_strength, created_at, updated_at
            ) VALUES ?
            ON DUPLICATE KEY UPDATE
              name = VALUES(name),
              role = VALUES(role),
              company = VALUES(company),
              email = VALUES(email),
              notes = VALUES(notes),
              relationship_strength = VALUES(relationship_strength),
              updated_at = VALUES(updated_at)
          `;
          
          await connection.query(contactSql, [contactValues]);
        }
        console.log(`[Sync] Contacts synced (${contacts.length}) in ${Date.now() - contactStart}ms`);
      }

      // 3. Sync Applications
      if (applications && applications.length > 0) {
        const appStart = Date.now();
        
        // Only fetch contacts referenced in this batch
        const referencedContactIds = Array.from(new Set(applications.map(a => a.contact_id).filter(Boolean)));
        let contactMap = new Map();
        
        if (referencedContactIds.length > 0) {
          const [contactRows] = await connection.query<RowDataPacket[]>(
            'SELECT id, public_id FROM contacts WHERE user_id = ? AND public_id IN (?)',
            [userId, referencedContactIds]
          );
          contactMap = new Map(contactRows.map((row: any) => [row.public_id, row.id]));
        }
        
        console.log(`[Sync] Contact map built (${contactMap.size} entries) in ${Date.now() - appStart}ms`);

        const appChunks = chunkArray(applications, BATCH_SIZE);

        for (const chunk of appChunks) {
          const appValues = chunk.map((app: Application) => {
            const contactId = app.contact_id ? contactMap.get(app.contact_id) || null : null;
            const mapped = mapApplicationToDb(app, userId, contactId);
            return mapped;
          });

          const appSql = `
            INSERT INTO applications (
              public_id, user_id, company_name, job_title, status, location, action_date, contact_id,
              role_family, seniority_level, department, work_type, city, country, timezone,
              fit_score, confidence_score, priority_score, user_interest_level, strategic_value,
              is_stale, is_overdue, is_heating_up, is_high_priority, is_cooling,
              channel_type,
              application_source, job_posting_url, job_id, application_platform, application_method, cover_letter_included, ats_detected,
              primary_contact_name, primary_contact_email,
              outreach_type, personalization_level, template_used,
              recruiting_agency, recruiter_type, job_confirmed,
              next_follow_up_at, follow_up_status, follow_up_priority,
              resume_file_url, notes,
              created_at, updated_at, last_activity_at
            ) VALUES ?
            ON DUPLICATE KEY UPDATE
              status = VALUES(status),
              action_date = VALUES(action_date),
              contact_id = VALUES(contact_id),
              updated_at = VALUES(updated_at),
              last_activity_at = VALUES(last_activity_at),
              notes = VALUES(notes)
          `;

          await connection.query(appSql, [appValues]);
        }
        console.log(`[Sync] Applications inserted (${applications.length}) in ${Date.now() - appStart}ms`);
      }

      // 4. Sync Activities
      if (activities && activities.length > 0) {
        const actStart = Date.now();
        
        // Only fetch applications referenced in this batch
        const referencedAppIds = Array.from(new Set(activities.map(a => a.application_id).filter(Boolean)));
        let appMap = new Map();
        
        if (referencedAppIds.length > 0) {
          const [appRows] = await connection.query<RowDataPacket[]>(
            'SELECT id, public_id FROM applications WHERE user_id = ? AND public_id IN (?)',
            [userId, referencedAppIds]
          );
          appMap = new Map(appRows.map((row: any) => [row.public_id, row.id]));
        }
        
        console.log(`[Sync] App map built (${appMap.size} entries) in ${Date.now() - actStart}ms`);

        const activityChunks = chunkArray(activities, BATCH_SIZE);

        for (const chunk of activityChunks) {
          const activityValues = [];
          for (const act of chunk as any[]) { // Type assertion for chunk
             if (appMap.has(act.application_id)) {
              activityValues.push([
                act.id, // public_id
                userId,
                appMap.get(act.application_id), // internal app id
                act.activity_type,
                new Date(act.activity_at),
                act.actor,
                act.notes || null,
                act.metadata_json || null,
                new Date(act.activity_at), // created_at approx
                act.updated_at ? new Date(act.updated_at) : new Date()
              ]);
            }
          }

          if (activityValues.length > 0) {
            const activitySql = `
              INSERT INTO activities (
                public_id, user_id, application_id, activity_type, activity_at, actor, notes, metadata_json, created_at, updated_at
              ) VALUES ?
              ON DUPLICATE KEY UPDATE
                notes = VALUES(notes),
                updated_at = VALUES(updated_at)
            `;
            await connection.query(activitySql, [activityValues]);
          }
        }
        console.log(`[Sync] Activities synced (${activities.length}) in ${Date.now() - actStart}ms`);
      }

      // 5. Sync Reminders
      if (reminders && reminders.length > 0) {
        const remStart = Date.now();
        
        const referencedAppIds = Array.from(new Set(reminders.map(r => r.related_entity_type === 'APPLICATION' ? r.related_entity_id : null).filter(Boolean)));
        const referencedContactIds = Array.from(new Set(reminders.map(r => r.related_entity_type === 'CONTACT' ? r.related_entity_id : null).filter(Boolean)));
        
        let appMap = new Map();
        let contactMap = new Map();
        
        if (referencedAppIds.length > 0) {
          const [appRows] = await connection.query<RowDataPacket[]>(
            'SELECT id, public_id FROM applications WHERE user_id = ? AND public_id IN (?)',
            [userId, referencedAppIds]
          );
          appMap = new Map(appRows.map((row: any) => [row.public_id, row.id]));
        }
        
        if (referencedContactIds.length > 0) {
          const [contactRows] = await connection.query<RowDataPacket[]>(
            'SELECT id, public_id FROM contacts WHERE user_id = ? AND public_id IN (?)',
            [userId, referencedContactIds]
          );
          contactMap = new Map(contactRows.map((row: any) => [row.public_id, row.id]));
        }

        const reminderChunks = chunkArray(reminders, BATCH_SIZE);

        for (const chunk of reminderChunks) {
          const reminderValues = chunk.map((r: Reminder) => [
            r.id, // public_id
            userId,
            r.title,
            r.description || null,
            new Date(r.due_at),
            r.priority || 'MEDIUM',
            r.completed ? 1 : 0,
            r.related_entity_type === 'APPLICATION' ? appMap.get(r.related_entity_id!) : null,
            r.related_entity_type === 'CONTACT' ? contactMap.get(r.related_entity_id!) : null,
            new Date(r.created_at),
            new Date() // updated_at
          ]);

          const reminderSql = `
            INSERT INTO reminders (
              public_id, user_id, title, description, due_at, priority, completed, 
              related_application_id, related_contact_id, created_at, updated_at
            ) VALUES ?
            ON DUPLICATE KEY UPDATE
              title = VALUES(title),
              description = VALUES(description),
              due_at = VALUES(due_at),
              priority = VALUES(priority),
              completed = VALUES(completed),
              updated_at = VALUES(updated_at)
          `;
          await connection.query(reminderSql, [reminderValues]);
        }
        console.log(`[Sync] Reminders synced (${reminders.length}) in ${Date.now() - remStart}ms`);
      }

      await connection.commit();
      console.log(`[Sync] Transaction committed. Total time: ${Date.now() - start}ms`);
      return NextResponse.json({ success: true, message: 'Sync completed successfully' });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 });
  }
}
