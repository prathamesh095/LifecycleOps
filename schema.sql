-- 1. USERS (Foundation for Multi-tenancy)
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    public_id CHAR(36) NOT NULL UNIQUE, -- UUID for frontend
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CONTACTS
CREATE TABLE contacts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    public_id CHAR(36) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    company VARCHAR(255),
    email VARCHAR(255),
    notes TEXT,
    relationship_strength ENUM('WEAK', 'MODERATE', 'STRONG'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_contacts_user_company (user_id, company),
    INDEX idx_contacts_user_updated (user_id, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. APPLICATIONS (The Core Entity)
CREATE TABLE applications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    public_id CHAR(36) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Core Identity
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    status ENUM('DRAFT', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED', 'WITHDRAWN', 'GHOSTED') NOT NULL DEFAULT 'DRAFT',
    location VARCHAR(255),
    action_date DATE NOT NULL,
    
    -- Hierarchy & Relationships
    contact_id BIGINT UNSIGNED, -- Primary contact
    parent_application_id BIGINT UNSIGNED, -- For 'FOLLOW_UP' channel type
    
    -- Rich Metadata (Identity Layer)
    role_family ENUM('ENGINEERING', 'DESIGN', 'PRODUCT', 'DATA', 'SALES', 'MARKETING', 'OPERATIONS', 'OTHER'),
    seniority_level ENUM('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'STAFF', 'PRINCIPAL', 'EXECUTIVE'),
    department VARCHAR(255),
    work_type ENUM('REMOTE', 'HYBRID', 'ONSITE'),
    city VARCHAR(100),
    country VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Intelligence & Scoring
    fit_score TINYINT UNSIGNED, -- 0-100
    confidence_score TINYINT UNSIGNED, -- 0-100
    priority_score TINYINT UNSIGNED, -- 0-100
    user_interest_level ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    strategic_value ENUM('LOW', 'MEDIUM', 'HIGH'),
    
    -- Engine Flags (Booleans as TINYINT)
    is_stale TINYINT(1) DEFAULT 0,
    is_overdue TINYINT(1) DEFAULT 0,
    is_heating_up TINYINT(1) DEFAULT 0,
    is_high_priority TINYINT(1) DEFAULT 0,
    is_cooling TINYINT(1) DEFAULT 0,
    
    -- Channel Specifics (Normalized Columns)
    channel_type ENUM('DIRECT_APPLY', 'OUTREACH', 'REFERRAL', 'RECRUITER', 'FOLLOW_UP') NOT NULL,
    
    -- Direct Apply Fields
    application_source VARCHAR(255),
    job_posting_url TEXT,
    job_id VARCHAR(100),
    application_platform VARCHAR(100),
    application_method ENUM('WEB_FORM', 'EASY_APPLY', 'EMAIL', 'OTHER'),
    cover_letter_included TINYINT(1) DEFAULT 0,
    ats_detected TINYINT(1) DEFAULT 0,
    
    -- Outreach/Referral/Recruiter Shared Fields
    -- (We map 'contact_name', 'referrer_name', 'recruiter_name' to this column based on channel_type)
    primary_contact_name VARCHAR(255), 
    primary_contact_email VARCHAR(255),
    
    -- Outreach Specifics
    outreach_type ENUM('COLD', 'WARM', 'REFERRAL_REQUEST', 'NETWORKING'),
    personalization_level ENUM('LOW', 'MEDIUM', 'HIGH'),
    template_used VARCHAR(255),
    response_received TINYINT(1) DEFAULT 0,
    response_sentiment ENUM('POSITIVE', 'NEUTRAL', 'NEGATIVE'),
    conversation_status ENUM('NO_REPLY', 'ACTIVE', 'CLOSED'),
    last_reply_date DATETIME,
    potential_role_discussed VARCHAR(255),
    potential_job_url TEXT,
    
    -- Recruiter Specifics
    recruiting_agency VARCHAR(255),
    recruiter_type ENUM('INTERNAL', 'EXTERNAL_AGENCY'),
    job_confirmed TINYINT(1) DEFAULT 0,
    
    -- Follow Up Specifics
    next_follow_up_at DATETIME,
    follow_up_status ENUM('NONE', 'SCHEDULED', 'DUE_SOON', 'OVERDUE', 'COMPLETED') DEFAULT 'NONE',
    follow_up_priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    
    -- Assets
    resume_file_url TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_application_id) REFERENCES applications(id) ON DELETE CASCADE,
    
    INDEX idx_apps_user_status (user_id, status),
    INDEX idx_apps_user_company (user_id, company_name),
    INDEX idx_apps_follow_up (user_id, next_follow_up_at, follow_up_status),
    INDEX idx_apps_user_updated (user_id, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TAGS (Many-to-Many)
CREATE TABLE tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_tag (user_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE application_tags (
    application_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    
    PRIMARY KEY (application_id, tag_id),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ACTIVITIES (Timeline)
CREATE TABLE activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    public_id CHAR(36) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    application_id BIGINT UNSIGNED NOT NULL,
    
    activity_type ENUM(
        'APPLICATION_CREATED', 'APPLIED', 'FOLLOWED_UP', 'RECRUITER_REPLY', 
        'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_RECEIVED', 
        'STATUS_CHANGED', 'NOTE_ADDED', 'FOLLOW_UP_SCHEDULED', 'RESCHEDULED'
    ) NOT NULL,
    
    activity_at DATETIME NOT NULL,
    actor ENUM('USER', 'COMPANY') DEFAULT 'USER',
    notes TEXT,
    metadata_json JSON, -- Flexible storage for extra event details
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_activities_app_date (application_id, activity_at DESC),
    INDEX idx_activities_user_updated (user_id, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. REMINDERS
CREATE TABLE reminders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    public_id CHAR(36) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_at DATETIME NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    completed TINYINT(1) DEFAULT 0,
    
    -- Polymorphic Relationships
    related_application_id BIGINT UNSIGNED,
    related_contact_id BIGINT UNSIGNED,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (related_contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    
    INDEX idx_reminders_due (user_id, completed, due_at),
    INDEX idx_reminders_user_updated (user_id, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. APPLICATION LINKS (Drive Links)
CREATE TABLE application_links (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT UNSIGNED NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
