# Database Design Documentation

## 1. Entity Relationship Explanation

The schema is designed around the **Application** entity, which acts as the central fact table for the tracking system.

*   **Users**: The root entity. All other entities (`applications`, `contacts`, `activities`, `tags`) belong to a user, enabling multi-tenancy.
*   **Applications**: A "Wide Table" design. It contains core identity fields (`company`, `role`) and normalized columns for channel-specific data (`outreach_type`, `recruiter_name`). This avoids the complexity of 5+ join tables for basic application details while maintaining data integrity.
*   **Contacts**: A first-class entity. Contacts can exist independently of applications (e.g., a recruiter you haven't applied to yet) or be linked to specific applications.
*   **Activities**: An append-only log of all events. It links to `applications` to provide the timeline view.
*   **Tags**: A many-to-many relationship with applications, allowing flexible categorization (e.g., "Remote", "High Salary", "Dream Company").
*   **Reminders**: A polymorphic task system. A reminder can link to an `application` OR a `contact`.

## 2. Index Strategy

We prioritize read performance for the most common UI views:

*   **Kanban/List View**: `idx_apps_user_status (user_id, status)`
    *   *Why*: The default view filters by user and groups by status. This index allows fetching all "INTERVIEWING" apps instantly.
*   **Focus Zone**: `idx_apps_follow_up (user_id, next_follow_up_at, follow_up_status)`
    *   *Why*: The dashboard needs to find "Overdue" or "Due Soon" items. This composite index covers the query `WHERE user_id = ? AND next_follow_up_at < NOW() AND follow_up_status != 'COMPLETED'`.
*   **Timeline**: `idx_activities_app_date (application_id, activity_at DESC)`
    *   *Why*: When opening an application detail view, we fetch the history sorted by date. This index avoids a filesort.
*   **Global Search**: `idx_apps_user_company (user_id, company_name)`
    *   *Why*: Autocomplete and search often target the company name.

## 3. Migration Strategy (Client-to-Server)

Since the current application uses IndexedDB (client-side), the "migration" is effectively an **Initial Sync**.

**Phase 1: Dual Write (Optional)**
*   Keep writing to IndexedDB.
*   Background job attempts to POST data to the new API.

**Phase 2: The Sync Endpoint**
*   **Endpoint**: `POST /api/sync/initial`
*   **Logic**:
    1.  Receive full JSON dump from client.
    2.  Iterate through applications.
    3.  Use `INSERT IGNORE` or `ON DUPLICATE KEY UPDATE` based on the `public_id` (UUID).
    4.  Map the flat JSON structure to the relational schema (e.g., extracting `tags` into the `tags` table).

**Phase 3: Switchover**
*   Once sync is confirmed, the frontend switches to reading/writing from the API instead of IndexedDB.

## 4. Known Tradeoffs

*   **Wide Table (`applications`)**:
    *   *Tradeoff*: The table has ~50 columns, many of which are NULL depending on `channel_type`.
    *   *Justification*: MySQL handles NULLs efficiently. The alternative (Table-per-Type inheritance) would require complex joins for simple queries like "Show all my active applications", hurting performance and developer experience.
*   **String Duplication**:
    *   *Tradeoff*: `company_name` is stored as a string, not a reference to a `companies` table.
    *   *Justification*: User input is messy ("Google" vs "Google Inc"). Normalizing this prematurely adds friction. We prioritize capturing user intent over strict 3NF for company names.
*   **JSON in Activities**:
    *   *Tradeoff*: `metadata_json` field in `activities`.
    *   *Justification*: Activity types vary wildly. Storing structured data (like "old_status" -> "new_status" diffs) in JSON is more flexible than adding 20 more columns to the activities table.
