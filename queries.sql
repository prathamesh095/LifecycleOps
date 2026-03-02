-- ==========================================
-- EXAMPLE INSERT QUERIES
-- ==========================================

-- 1. Create a User
INSERT INTO users (public_id, email, name) 
VALUES (UUID(), 'jane@example.com', 'Jane Doe');

-- 2. Create a Contact (Recruiter)
INSERT INTO contacts (public_id, user_id, name, role, company, email, relationship_strength)
VALUES (
    UUID(), 
    1, -- User ID
    'Sarah Jenkins', 
    'Senior Tech Recruiter', 
    'Google', 
    'sarah.j@google.com', 
    'MODERATE'
);

-- 3. Create a Direct Application
INSERT INTO applications (
    public_id, user_id, 
    company_name, job_title, status, location, action_date,
    channel_type, application_source, job_posting_url,
    fit_score, confidence_score, priority_score
) VALUES (
    UUID(), 1,
    'Google', 'Senior Frontend Engineer', 'APPLIED', 'Mountain View, CA', CURDATE(),
    'DIRECT_APPLY', 'LinkedIn', 'https://linkedin.com/jobs/...',
    85, 90, 88
);

-- 4. Create an Outreach Application (Networking)
INSERT INTO applications (
    public_id, user_id,
    company_name, job_title, status, action_date,
    channel_type, outreach_type, primary_contact_name, personalization_level,
    notes
) VALUES (
    UUID(), 1,
    'Linear', 'Product Engineer', 'DRAFT', CURDATE(),
    'OUTREACH', 'COLD', 'Karri Saarinen', 'HIGH',
    'Drafting a cold email about their new features...'
);

-- 5. Log an Activity (Status Change)
INSERT INTO activities (
    public_id, user_id, application_id, 
    activity_type, activity_at, notes, metadata_json
) VALUES (
    UUID(), 1, 1, -- App ID 1
    'STATUS_CHANGED', NOW(), 
    'Moved to Interviewing', 
    '{"old_status": "APPLIED", "new_status": "INTERVIEWING"}'
);

-- ==========================================
-- EXAMPLE READ QUERIES
-- ==========================================

-- 1. Kanban Board: Get all active applications for a user
SELECT id, public_id, company_name, job_title, status, next_follow_up_at
FROM applications
WHERE user_id = 1 
AND status NOT IN ('REJECTED', 'WITHDRAWN', 'GHOSTED')
ORDER BY updated_at DESC;

-- 2. Focus Zone: Get overdue follow-ups
SELECT id, company_name, job_title, next_follow_up_at, follow_up_priority
FROM applications
WHERE user_id = 1
AND next_follow_up_at < NOW()
AND follow_up_status != 'COMPLETED'
ORDER BY next_follow_up_at ASC;

-- 3. Timeline: Get full history for an application
SELECT activity_type, activity_at, notes, metadata_json
FROM activities
WHERE application_id = 1
ORDER BY activity_at DESC;

-- 4. Analytics: Conversion Rate by Channel
SELECT 
    channel_type,
    COUNT(*) as total_apps,
    SUM(CASE WHEN status = 'OFFER' THEN 1 ELSE 0 END) as offers,
    (SUM(CASE WHEN status = 'OFFER' THEN 1 ELSE 0 END) / COUNT(*)) * 100 as conversion_rate
FROM applications
WHERE user_id = 1
GROUP BY channel_type;
