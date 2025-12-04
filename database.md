# 📊 Database Documentation

## Overview

This Healthcare Portal uses **MongoDB** as the database, connected via **Djongo** (Django MongoDB connector). The database is hosted on **MongoDB Atlas** (cloud) and contains collections for user management, wellness tracking, and health information.

**Database Name:** `healthcare_portal`

---

## 🗂️ Collections (Documents)

### 1. `accounts_user` - User Accounts

Stores all user information including patients, healthcare providers, and administrators.

```javascript
{
  "_id": ObjectId,                    // MongoDB auto-generated ID
  "password": String,                 // Hashed password (PBKDF2 + SHA256)
  "last_login": DateTime,             // Last login timestamp
  "is_superuser": Boolean,            // Django admin flag
  "email": String,                    // Unique email (used as username)
  "first_name": String,               // User's first name
  "last_name": String,                // User's last name
  "role": String,                     // "patient" | "provider" | "admin"
  "phone": String | null,             // Phone number (optional)
  "date_of_birth": Date | null,       // DOB for age calculation
  "data_consent": Boolean,            // HIPAA consent flag
  "consent_date": DateTime | null,    // When consent was given
  "profile_picture": String | null,   // Path to profile image
  "address": String | null,           // Full address
  "emergency_contact": String | null, // Emergency contact name
  "emergency_phone": String | null,   // Emergency contact phone
  "is_staff": Boolean,                // Django admin access
  "is_active": Boolean,               // Account active status
  "created_at": DateTime,             // Account creation timestamp
  "updated_at": DateTime              // Last update timestamp
}
```

**Purpose:** Central authentication and user identity. Role field determines access permissions across the application.

**Indexes:**
- `email` (unique) - For login lookups
- `role` - For filtering patients vs providers

---

### 2. `accounts_patientprofile` - Patient Health Profiles

Extended profile information for users with role="patient".

```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,               // Reference to accounts_user
  "blood_type": String | null,       // "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
  "height": Decimal | null,          // Height in centimeters
  "weight": Decimal | null,          // Weight in kilograms
  "allergies": String | null,        // List of allergies (text)
  "current_medications": String | null, // Current medications (text)
  "medical_conditions": String | null,  // Existing conditions (text)
  "assigned_provider_id": ObjectId | null, // Healthcare provider assignment
  "created_at": DateTime,
  "updated_at": DateTime
}
```

**Purpose:** Stores sensitive health information for patients. Linked to a provider for care coordination.

**HIPAA Considerations:**
- This collection contains PHI (Protected Health Information)
- Access logged via `accounts_auditlog`
- Only the patient and assigned provider can access

---

### 3. `accounts_providerprofile` - Healthcare Provider Profiles

Extended profile for users with role="provider".

```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,               // Reference to accounts_user
  "specialization": String | null,   // Medical specialization
  "license_number": String | null,   // Medical license number
  "hospital_affiliation": String | null, // Hospital/clinic name
  "years_of_experience": Integer,    // Years practicing
  "created_at": DateTime,
  "updated_at": DateTime
}
```

**Purpose:** Professional credentials for healthcare providers. Used for verification and display.

---

### 4. `accounts_auditlog` - Security Audit Trail

HIPAA-compliant logging of all data access and modifications.

```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,               // User who performed action
  "action": String,                  // Action type (see below)
  "resource": String | null,         // Resource accessed (e.g., "PatientProfile")
  "resource_id": String | null,      // Specific record ID
  "ip_address": String | null,       // Client IP address
  "user_agent": String | null,       // Browser/device info
  "details": Object | null,          // Additional context (JSON)
  "timestamp": DateTime              // When action occurred
}
```

**Action Types:**
- `login` - User logged in
- `logout` - User logged out
- `view_profile` - User viewed their profile
- `update_profile` - User updated their profile
- `view_patient` - Provider viewed patient data
- `update_patient` - Provider updated patient data
- `export_data` - Data was exported

**Purpose:** Security compliance and audit trail. Required for HIPAA compliance to track all PHI access.

---

### 5. `wellness_wellnessgoal` - Wellness Goals

Daily health goals for patients to track.

```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,               // Patient who owns this goal
  "goal_type": String,               // "steps" | "active_time" | "sleep" | "water" | "calories" | "custom"
  "title": String,                   // Display name (e.g., "Daily Steps")
  "target_value": Decimal,           // Goal target (e.g., 6000 for steps)
  "current_value": Decimal,          // Current progress (starts at 0)
  "unit": String,                    // Unit of measurement ("steps", "mins", "hours", "ml")
  "date": Date,                      // Date this goal is for
  "is_completed": Boolean,           // True when current >= target
  "extra_data": Object | null,       // Type-specific data (see below)
  "created_at": DateTime,
  "updated_at": DateTime
}
```

**Extra Data Examples:**
```javascript
// For sleep goals:
{
  "sleep_start": "23:30",    // Bedtime
  "sleep_end": "07:30"       // Wake time
}

// For active_time goals:
{
  "calories": 1712,          // Calories burned
  "distance": 1.23           // Distance in km
}
```

**Purpose:** Core wellness tracking feature. New goals are auto-created daily with `current_value: 0`.

**Unique Constraint:** `(user_id, goal_type, date)` - One goal of each type per day per user.

---

### 6. `wellness_dailygoallog` - Progress Log Entries

Individual log entries for goal progress throughout the day.

```javascript
{
  "_id": ObjectId,
  "goal_id": ObjectId,               // Reference to wellness_wellnessgoal
  "value": Decimal,                  // Progress value logged
  "notes": String | null,            // Optional notes
  "logged_at": DateTime              // When this entry was logged
}
```

**Purpose:** Granular tracking of progress. Each log entry adds to the goal's `current_value`.

**Example:** User logs 1000 steps at 9am, 2000 at noon, 500 at 3pm → Total shows 3500 steps.

---

### 7. `wellness_preventivecarereminder` - Preventive Care Reminders

Scheduled health checkups and preventive care appointments.

```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,               // Patient who owns this reminder
  "reminder_type": String,           // "blood_test" | "vaccination" | "checkup" | "screening" | "dental" | "eye_exam" | "custom"
  "title": String,                   // Display title
  "description": String | null,      // Detailed description
  "scheduled_date": Date,            // Date of appointment
  "scheduled_time": Time | null,     // Time of appointment
  "status": String,                  // "upcoming" | "completed" | "missed" | "rescheduled"
  "location": String | null,         // Clinic/hospital location
  "notes": String | null,            // Additional notes
  "is_recurring": Boolean,           // Recurring reminder flag
  "recurrence_interval": Integer | null, // Days between recurrences
  "created_at": DateTime,
  "updated_at": DateTime
}
```

**Purpose:** Helps patients stay compliant with preventive care. Providers can view compliance status.

---

### 8. `wellness_healthtip` - Health Tips

Daily health tips shown on the dashboard.

```javascript
{
  "_id": ObjectId,
  "title": String,                   // Tip title
  "content": String,                 // Tip content/advice
  "category": String,                // "nutrition" | "exercise" | "sleep" | "mental_health" | "hydration" | "general"
  "is_active": Boolean,              // Show this tip or not
  "display_date": Date | null,       // Specific date to show (null = random)
  "created_at": DateTime
}
```

**Purpose:** Educational content for patients. Random tip shown if no specific date match.

---

### 9. `health_info_healtharticle` - Health Articles

Public health information articles.

```javascript
{
  "_id": ObjectId,
  "title": String,                   // Article title
  "slug": String,                    // URL-friendly slug (unique)
  "summary": String,                 // Short description
  "content": String,                 // Full HTML content
  "category": String,                // "covid" | "flu" | "mental_health" | "nutrition" | "fitness" | "preventive" | "general"
  "image_url": String | null,        // Cover image URL
  "is_featured": Boolean,            // Featured on homepage
  "is_published": Boolean,           // Published status
  "created_at": DateTime,
  "updated_at": DateTime
}
```

**Purpose:** Public health information accessible without login. Displayed on homepage and health topics page.

---

### 10. `health_info_privacypolicy` - Privacy Policy

HIPAA-compliant privacy policy document.

```javascript
{
  "_id": ObjectId,
  "title": String,                   // Policy title
  "content": String,                 // Full HTML content
  "version": String,                 // Version number (e.g., "1.0")
  "effective_date": Date,            // When policy takes effect
  "is_active": Boolean,              // Current active policy
  "created_at": DateTime,
  "updated_at": DateTime
}
```

**Purpose:** Legal compliance. Only one policy should be `is_active: true` at a time.

---

### 11. `health_info_faq` - Frequently Asked Questions

Common questions and answers.

```javascript
{
  "_id": ObjectId,
  "question": String,                // Question text
  "answer": String,                  // Answer text
  "category": String,                // Category for filtering
  "order": Integer,                  // Display order
  "is_active": Boolean,              // Show this FAQ
  "created_at": DateTime
}
```

**Purpose:** Self-service support. Reduces support burden and improves user experience.

---

## 📈 Data Flow Diagram

```
User Registration:
┌──────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│ Registration │───▶│ accounts_user    │───▶│ accounts_patient/   │
│ Form         │    │ (role: patient)  │    │ provider_profile    │
└──────────────┘    └──────────────────┘    └─────────────────────┘

Daily Goal Tracking:
┌──────────────┐    ┌──────────────────────┐    ┌────────────────────┐
│ Dashboard    │───▶│ wellness_wellnessgoal │◀───│ wellness_daily     │
│ Load         │    │ (auto-created daily) │    │ goallog (entries)  │
└──────────────┘    └──────────────────────┘    └────────────────────┘

Provider View:
┌──────────────┐    ┌──────────────────────┐    ┌────────────────────┐
│ Provider     │───▶│ accounts_patient     │───▶│ wellness_goals &   │
│ Dashboard    │    │ profile (assigned)   │    │ reminders          │
└──────────────┘    └──────────────────────┘    └────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ accounts_auditlog│
                    │ (access logged)  │
                    └──────────────────┘
```

---

## 🔐 Security Considerations

### Data Encryption
- Passwords: PBKDF2 with SHA256 (Django default)
- MongoDB Atlas: Encryption at rest enabled
- HTTPS: All API calls encrypted in transit

### Access Control
| Collection | Patient Access | Provider Access | Admin Access |
|------------|---------------|-----------------|--------------|
| accounts_user | Own only | Own only | All |
| accounts_patientprofile | Own only | Assigned patients | All |
| accounts_providerprofile | None | Own only | All |
| wellness_wellnessgoal | Own only | Assigned patients (read) | All |
| wellness_preventivecarereminder | Own only | Assigned patients (read) | All |
| health_info_* | Public (read) | Public (read) | All |

### Audit Logging
All PHI access is logged to `accounts_auditlog` with:
- User ID
- Action performed
- Resource accessed
- IP address
- Timestamp

---

## 🛠️ MongoDB Atlas Setup

### Cluster Information
- **Provider:** MongoDB Atlas (M0 Free Tier)
- **Region:** Based on selection during setup
- **Database Name:** `healthcare_portal`

### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/healthcare_portal
```

### Collections Created by Django Migrations
When you run `python manage.py migrate`, Django creates:

1. `accounts_user`
2. `accounts_patientprofile`
3. `accounts_providerprofile`
4. `accounts_auditlog`
5. `wellness_wellnessgoal`
6. `wellness_dailygoallog`
7. `wellness_preventivecarereminder`
8. `wellness_healthtip`
9. `health_info_healtharticle`
10. `health_info_privacypolicy`
11. `health_info_faq`
12. `django_migrations` (migration tracking)
13. `django_session` (session storage)
14. `django_content_type` (Django internal)
15. `auth_permission` (Django permissions)
16. `auth_group` (Django groups)
17. `django_admin_log` (Admin actions)

---

## 📋 Sample Data

### Sample User Document
```javascript
{
  "_id": ObjectId("..."),
  "email": "david@example.com",
  "first_name": "David",
  "last_name": "Smith",
  "role": "patient",
  "data_consent": true,
  "consent_date": ISODate("2025-12-04T10:00:00Z"),
  "is_active": true,
  "created_at": ISODate("2025-12-04T10:00:00Z")
}
```

### Sample Wellness Goal Document
```javascript
{
  "_id": ObjectId("..."),
  "user_id": ObjectId("..."),
  "goal_type": "steps",
  "title": "Daily Steps",
  "target_value": 6000,
  "current_value": 0,        // Starts at 0 for new users
  "unit": "steps",
  "date": ISODate("2025-12-04"),
  "is_completed": false,
  "created_at": ISODate("2025-12-04T10:00:00Z")
}
```

---

## 🔄 Data Lifecycle

### New User Registration
1. `accounts_user` document created with `role: "patient"` or `"provider"`
2. `accounts_patientprofile` or `accounts_providerprofile` created
3. `data_consent: true` and `consent_date` set if consent given

### Daily Goal Creation
1. When patient accesses dashboard, system checks for today's goals
2. If no goals exist for today, default goals created with `current_value: 0`
3. Goals: Steps (6000), Active Time (60 mins), Sleep (8 hours)

### Progress Logging
1. User logs progress via dashboard input
2. `wellness_dailygoallog` entry created with value
3. `wellness_wellnessgoal.current_value` incremented
4. If `current_value >= target_value`, `is_completed` set to `true`

### Data Retention
- User data: Retained until account deletion
- Audit logs: Retained for 7 years (HIPAA requirement)
- Health articles: Retained indefinitely

