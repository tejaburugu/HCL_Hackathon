# Healthcare Portal - Entity Relationship Diagram

## Visual ER Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o| PATIENT_PROFILE : "has (if patient)"
    USER ||--o| PROVIDER_PROFILE : "has (if provider)"
    USER ||--o{ WELLNESS_GOAL : creates
    USER ||--o{ PREVENTIVE_CARE_REMINDER : creates
    USER ||--o{ AUDIT_LOG : generates
    WELLNESS_GOAL ||--o{ DAILY_GOAL_LOG : contains
    PATIENT_PROFILE }o--|| USER : "assigned_to (provider)"

    USER {
        ObjectId _id PK
        string email UK "Unique email"
        string password "Hashed"
        string first_name
        string last_name
        enum role "patient|provider|admin"
        string phone
        date date_of_birth
        boolean data_consent "HIPAA"
        datetime consent_date
        text address
        string emergency_contact
        string emergency_phone
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    PATIENT_PROFILE {
        ObjectId _id PK
        ObjectId user_id FK "References USER"
        enum blood_type "A+|A-|B+|B-|AB+|AB-|O+|O-"
        decimal height "in cm"
        decimal weight "in kg"
        text allergies
        text current_medications
        text medical_conditions
        ObjectId assigned_provider FK "References USER (provider)"
        datetime created_at
        datetime updated_at
    }

    PROVIDER_PROFILE {
        ObjectId _id PK
        ObjectId user_id FK "References USER"
        string specialization
        string license_number
        string hospital_affiliation
        int years_of_experience
        datetime created_at
        datetime updated_at
    }

    WELLNESS_GOAL {
        ObjectId _id PK
        ObjectId user_id FK "References USER"
        enum goal_type "steps|active_time|sleep|water|calories|custom"
        string title
        float target_value
        float current_value "Default 0"
        string unit "steps|mins|hours|glasses|kcal"
        date date "Indexed"
        boolean is_completed "Auto-calculated"
        boolean is_recurring "For daily goals"
        json extra_data "Optional metadata"
        datetime created_at
        datetime updated_at
    }

    DAILY_GOAL_LOG {
        ObjectId _id PK
        ObjectId goal_id FK "References WELLNESS_GOAL"
        float value "Logged amount"
        text notes "Optional"
        datetime logged_at "Auto timestamp"
    }

    PREVENTIVE_CARE_REMINDER {
        ObjectId _id PK
        ObjectId user_id FK "References USER"
        enum reminder_type "appointment|vaccination|screening|medication|checkup|other"
        string title
        text description
        date scheduled_date
        time scheduled_time
        enum status "pending|completed|cancelled|missed"
        string location
        text notes
        boolean is_recurring
        int recurrence_interval "Days"
        datetime created_at
        datetime updated_at
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId user_id FK "References USER"
        enum action "login|logout|view_profile|update_profile|view_patient|export_data"
        string resource "Table/collection name"
        string resource_id
        string ip_address
        text user_agent
        json details "Additional context"
        datetime timestamp
    }

    HEALTH_TIP {
        ObjectId _id PK
        string title
        text content
        enum category "hydration|exercise|sleep|nutrition|mental_health|general"
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    HEALTH_ARTICLE {
        ObjectId _id PK
        string title
        string slug UK "URL-friendly"
        text summary
        text content "HTML content"
        enum category "heart_health|preventive_care|mental_health|nutrition|covid|sleep"
        boolean is_featured
        boolean is_published
        datetime published_at
        datetime created_at
        datetime updated_at
    }

    FAQ {
        ObjectId _id PK
        string question
        text answer
        enum category "wellness|privacy|general"
        int order "Display order"
        datetime created_at
        datetime updated_at
    }

    PRIVACY_POLICY {
        ObjectId _id PK
        string version UK
        string title
        text content "HTML content"
        date effective_date
        boolean is_active
        datetime created_at
    }
```

---

## Simplified Relationship View

```mermaid
graph TB
    subgraph "User Management"
        U[USER]
        PP[PATIENT_PROFILE]
        PRP[PROVIDER_PROFILE]
        AL[AUDIT_LOG]
    end

    subgraph "Wellness Tracking"
        WG[WELLNESS_GOAL]
        DGL[DAILY_GOAL_LOG]
        PCR[PREVENTIVE_CARE_REMINDER]
    end

    subgraph "Health Information"
        HT[HEALTH_TIP]
        HA[HEALTH_ARTICLE]
        FAQ[FAQ]
        PV[PRIVACY_POLICY]
    end

    U -->|1:1| PP
    U -->|1:1| PRP
    U -->|1:N| AL
    U -->|1:N| WG
    U -->|1:N| PCR
    WG -->|1:N| DGL
    PP -.->|N:1 assigned| U
```

---

## Data Flow Diagram

```mermaid
flowchart LR
    subgraph Client["Frontend (React)"]
        UI[User Interface]
        CTX[Auth Context]
        API[API Service]
    end

    subgraph Server["Backend (Django)"]
        AUTH[Auth Module]
        WELL[Wellness Module]
        HEALTH[Health Info Module]
    end

    subgraph Database["MongoDB"]
        USERS[(Users)]
        GOALS[(Goals)]
        ARTICLES[(Articles)]
    end

    UI <--> CTX
    CTX <--> API
    API <-->|REST/JWT| AUTH
    API <-->|REST/JWT| WELL
    API <-->|REST| HEALTH

    AUTH <--> USERS
    WELL <--> USERS
    WELL <--> GOALS
    HEALTH <--> ARTICLES
```

---

## Table Relationships Summary

| Parent Table | Child Table | Relationship | Foreign Key |
|-------------|-------------|--------------|-------------|
| USER | PATIENT_PROFILE | 1:1 | user_id |
| USER | PROVIDER_PROFILE | 1:1 | user_id |
| USER | WELLNESS_GOAL | 1:N | user_id |
| USER | PREVENTIVE_CARE_REMINDER | 1:N | user_id |
| USER | AUDIT_LOG | 1:N | user_id |
| WELLNESS_GOAL | DAILY_GOAL_LOG | 1:N | goal_id |
| USER (provider) | PATIENT_PROFILE | 1:N | assigned_provider |

---

## Cardinality Notation

- `||--o|` : One to Zero or One
- `||--o{` : One to Zero or Many
- `}o--||` : Many to One (with optional)
- `||--|{` : One to One or Many

---

## How to View This Diagram

1. **GitHub/GitLab**: These platforms render Mermaid diagrams automatically
2. **VS Code**: Install "Markdown Preview Mermaid Support" extension
3. **Online**: Use [Mermaid Live Editor](https://mermaid.live/)
4. **Notion**: Paste Mermaid code in a code block with `mermaid` language

---

*Generated for Healthcare Wellness Portal*

