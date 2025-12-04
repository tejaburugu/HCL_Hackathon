# 🏥 Healthcare Wellness & Preventive Care Portal

A comprehensive healthcare portal designed to help patients achieve health goals and maintain compliance with preventive checkups, while enabling healthcare providers to monitor patient wellness.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Low Level Design](./docs/LOW_LEVEL_DESIGN.md) | Complete LLD with architecture, API design, data flows |
| [ER Diagram](./docs/ER_DIAGRAM.md) | Entity Relationship diagrams (Mermaid) |
| [Database Schema](./database.md) | MongoDB collections and field descriptions |

---

## 📋 Problem Statement

Develop a solution for a **Healthcare Wellness and Preventive Care Portal** that:
- Seamlessly integrates front-end and back-end technologies
- Focuses on wellness and preventive care to help patients achieve health goals
- Maintains compliance with preventive checkups
- Prioritizes usability, responsive design, and healthcare privacy standards (HIPAA)

---

## 🎯 Design Approach & Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   React Frontend                         │    │
│  │  • Public Pages (Home, Health Topics, Login/Register)   │    │
│  │  • Patient Dashboard (Goals, Reminders, Health Tips)    │    │
│  │  • Provider Dashboard (Patient Compliance Overview)     │    │
│  │  • Profile Management                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (JSON)
                              │ JWT Authentication
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API LAYER                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Django REST Framework                       │    │
│  │  • Authentication Endpoints (/api/auth/)                │    │
│  │  • Wellness Endpoints (/api/wellness/)                  │    │
│  │  • Health Info Endpoints (/api/health/)                 │    │
│  │  • Role-Based Access Control (Patient/Provider)         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Djongo ODM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    MongoDB                               │    │
│  │  • Users & Profiles (Encrypted sensitive data)          │    │
│  │  • Wellness Goals & Daily Logs                          │    │
│  │  • Preventive Care Reminders                            │    │
│  │  • Health Articles & FAQs                               │    │
│  │  • Audit Logs (HIPAA Compliance)                        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns**
   - Frontend handles UI/UX and user interactions
   - Backend handles business logic, authentication, and data management
   - Database layer stores and retrieves data with proper indexing

2. **Security-First Approach**
   - JWT-based authentication with token refresh mechanism
   - Role-based access control (RBAC) for patients vs providers
   - Audit logging for all data access (HIPAA compliance)
   - Data consent tracking during registration

3. **Scalable Architecture**
   - Stateless API design enabling horizontal scaling
   - NoSQL database (MongoDB) for flexible schema evolution
   - Modular Django apps for independent feature development

4. **User-Centric Design**
   - Intuitive dashboards matching provided wireframes
   - Real-time progress tracking with visual indicators
   - Personalized health tips and reminders

---

## 🏗️ Implementation Strategy

### Phase 1: Core Infrastructure
- [x] Django project setup with MongoDB (Djongo)
- [x] User authentication system (JWT)
- [x] Custom user model with role-based access
- [x] CORS configuration for frontend communication

### Phase 2: Backend Features
- [x] Patient profile management with health information
- [x] Provider profile with patient assignment
- [x] Wellness goals CRUD operations
- [x] Preventive care reminders system
- [x] Health articles and public information API
- [x] Audit logging for HIPAA compliance

### Phase 3: Frontend Development
- [x] Authentication pages (Login/Register) matching design
- [x] Patient dashboard with wellness goals visualization
- [x] Provider dashboard with patient compliance overview
- [x] Profile management with health information
- [x] Goal tracking and progress logging
- [x] Public health information pages

### Phase 4: Integration & Security
- [x] API integration with error handling
- [x] Token refresh mechanism
- [x] Protected routes based on user roles
- [x] Consent management during registration

---

## 🔐 Security & HIPAA Compliance Measures

### Authentication & Authorization
| Feature | Implementation |
|---------|---------------|
| Password Security | Django's PBKDF2 hashing with SHA256 |
| Session Management | JWT tokens with 1-hour access / 7-day refresh |
| Role-Based Access | Patient, Provider, Admin roles with permission checks |
| Token Blacklisting | Refresh token invalidation on logout |

### Data Protection
| Feature | Implementation |
|---------|---------------|
| Data Consent | Explicit consent checkbox with timestamp |
| Audit Logging | All data access logged with user, action, timestamp, IP |
| Access Controls | Users can only access their own data |
| Provider Access | Providers only see assigned patients |

### Audit Log Schema
```python
AuditLog:
  - user (who performed the action)
  - action (login, view_profile, update_patient, etc.)
  - resource (what was accessed)
  - resource_id (specific record)
  - ip_address (client IP)
  - user_agent (browser/device info)
  - timestamp (when it occurred)
```

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Django 3.1** | Web framework with robust security features |
| **Django REST Framework** | RESTful API development |
| **Simple JWT** | JSON Web Token authentication |
| **Djongo** | MongoDB connector for Django ORM |
| **MongoDB** | NoSQL database for flexible healthcare data |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | Component-based UI development |
| **Vite** | Fast build tool and dev server |
| **React Router** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **CSS Modules** | Scoped component styling |

### Design System
| Element | Choice |
|---------|--------|
| **Typography** | DM Sans (body), Instrument Serif (headings) |
| **Color Palette** | Navy (#1a1a2e), Teal accent (#4a90a4) |
| **Components** | Custom reusable components (Button, Input, Card, ProgressBar) |

---

## 📁 Project Structure

```
HCL-Hackathon/
├── Backend/
│   ├── accounts/           # User authentication & profiles
│   │   ├── models.py       # User, PatientProfile, ProviderProfile, AuditLog
│   │   ├── serializers.py  # API data serialization
│   │   ├── views.py        # Auth endpoints, profile management
│   │   └── urls.py         # Route definitions
│   │
│   ├── wellness/           # Health goals & reminders
│   │   ├── models.py       # WellnessGoal, DailyGoalLog, Reminder, HealthTip
│   │   ├── serializers.py  # Goal/reminder serialization
│   │   ├── views.py        # Dashboard, goal tracking, reminders
│   │   └── urls.py         # Wellness routes
│   │
│   ├── health_info/        # Public health content
│   │   ├── models.py       # HealthArticle, PrivacyPolicy, FAQ
│   │   ├── views.py        # Public endpoints
│   │   └── urls.py         # Health info routes
│   │
│   ├── core/               # Django project configuration
│   │   ├── settings.py     # Database, auth, CORS config
│   │   └── urls.py         # Main URL routing
│   │
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/     # Reusable UI components
│   │   │   └── layout/     # Page layouts (Navbar, Sidebar)
│   │   │
│   │   ├── context/        # React context (AuthContext)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── App.jsx         # Main app with routing
│   │   └── index.css       # Global styles
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🖥️ Key Features

### For Patients
| Feature | Description |
|---------|-------------|
| **Wellness Dashboard** | Visual progress tracking for steps, active time, sleep |
| **Goal Setting** | Create and track daily wellness goals |
| **Progress Logging** | Log daily progress towards goals |
| **Preventive Reminders** | Upcoming checkup and vaccination reminders |
| **Health Tips** | Daily personalized health tips |
| **Profile Management** | Manage personal and health information |

### For Healthcare Providers
| Feature | Description |
|---------|-------------|
| **Patient Overview** | View all assigned patients |
| **Compliance Tracking** | See goal completion status (Met/In Progress/Missed) |
| **Patient Details** | View individual patient goals and reminders |
| **Quick Actions** | Send reminders, schedule checkups |

### Public Features
| Feature | Description |
|---------|-------------|
| **Health Topics** | Browse health articles by category |
| **COVID-19 Updates** | Latest pandemic information |
| **Privacy Policy** | HIPAA-compliant privacy information |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd Backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env with your MongoDB connection string

# Run migrations
python manage.py makemigrations accounts wellness health_info
python manage.py migrate

# Seed initial data (optional)
python manage.py seed_data

# Start server
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login and get JWT tokens |
| POST | `/api/auth/logout/` | Logout and blacklist token |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/profile/` | Get user profile |
| PATCH | `/api/auth/profile/` | Update profile |

### Wellness (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wellness/dashboard/` | Get dashboard summary |
| GET | `/api/wellness/goals/` | List user's goals |
| POST | `/api/wellness/goals/` | Create new goal |
| POST | `/api/wellness/goals/{id}/log/` | Log progress |
| GET | `/api/wellness/reminders/` | List reminders |
| GET | `/api/wellness/health-tip/` | Get health tip of the day |

### Health Info (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/articles/` | List health articles |
| GET | `/api/health/articles/{slug}/` | Get article detail |
| GET | `/api/health/privacy-policy/` | Get privacy policy |
| GET | `/api/health/faqs/` | Get FAQs |

---

## 🎨 UI/UX Design Decisions

### Dashboard Design (Based on Provided Wireframes)

**Patient Dashboard Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  Sidebar          │  Main Content                            │
│  ┌─────────────┐  │  ┌──────────────────────────────────┐   │
│  │ 🏥 eHealth  │  │  │ Welcome, [User Name]              │   │
│  │             │  │  └──────────────────────────────────┘   │
│  │ 📊 Dashboard│  │                                          │
│  │ 👤 Profile  │  │  Wellness Goals                         │
│  │ 🎯 Goals    │  │  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ 🔔 Reminders│  │  │ Steps  │ │ Active │ │ Sleep  │      │
│  │             │  │  │ 3620   │ │ 56mins │ │ 6h30m  │      │
│  │             │  │  │ [====] │ │ [====] │ │ [====] │      │
│  │ 🚪 Logout   │  │  └────────┘ └────────┘ └────────┘      │
│  └─────────────┘  │                                          │
│                   │  Preventive Care Reminders               │
│                   │  • Annual blood test on 23rd Jan 2025    │
│                   │                                          │
│                   │  Health Tip of the Day                   │
│                   │  💡 Stay hydrated...                     │
└──────────────────────────────────────────────────────────────┘
```

**Design Choices:**
1. **Progress Visualization**: Horizontal progress bars with percentage labels for quick comprehension
2. **Sleep Indicator**: Block-based visual (like battery) for intuitive sleep quality display
3. **Color Coding**: 
   - Steps: Teal (#4a90a4)
   - Active Time: Green (#22c55e)
   - Sleep: Purple (#8b5cf6)
4. **Sidebar Navigation**: Persistent sidebar for easy navigation in dashboard views
5. **Card-Based Layout**: Modular cards for goals, reminders, and tips

---

## 🔄 Data Flow

### Authentication Flow
```
User → Login Form → POST /api/auth/login/
                         │
                         ▼
              Django validates credentials
                         │
                         ▼
              Generate JWT (access + refresh)
                         │
                         ▼
              Log action to AuditLog
                         │
                         ▼
              Return tokens + user data
                         │
                         ▼
        Frontend stores in localStorage
                         │
                         ▼
        Subsequent requests include Bearer token
```

### Goal Tracking Flow
```
Patient → Log Progress → POST /api/wellness/goals/{id}/log/
                              │
                              ▼
                   Validate user owns goal
                              │
                              ▼
                   Create DailyGoalLog entry
                              │
                              ▼
                   Update goal.current_value
                              │
                              ▼
                   Check if goal.is_completed
                              │
                              ▼
                   Return updated goal data
                              │
                              ▼
           Frontend updates progress bar
```

---

## 📊 Database Schema

### Core Collections

**Users**
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  first_name: String,
  last_name: String,
  role: "patient" | "provider" | "admin",
  data_consent: Boolean,
  consent_date: DateTime,
  created_at: DateTime
}
```

**PatientProfile**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: Users),
  blood_type: String,
  height: Decimal,
  weight: Decimal,
  allergies: String,
  current_medications: String,
  assigned_provider_id: ObjectId (ref: Users)
}
```

**WellnessGoal**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: Users),
  goal_type: "steps" | "active_time" | "sleep" | "water",
  title: String,
  target_value: Decimal,
  current_value: Decimal,
  unit: String,
  date: Date,
  is_completed: Boolean,
  extra_data: Object
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is developed for the HCL Hackathon.

---

## 👥 Team

- **Project**: Healthcare Wellness & Preventive Care Portal MVP
- **Duration**: 5-Hour Hackathon
- **Focus**: Security, Personalization, Healthcare Compliance
