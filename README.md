# Team Task Manager

Full-stack team task management application built with FastAPI + React. Designed and implemented for Ethara.ai recruitment process with enterprise-grade security features.

## Tech Stack
- **Backend**: Python 3.11 + FastAPI + SQLAlchemy + PostgreSQL/SQLite
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Auth**: JWT tokens (python-jose + bcrypt)
- **Security**: Rate limiting, input validation, audit logging, security headers
- **Deploy**: Railway

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL running locally

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: set DATABASE_URL and SECRET_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000
npm run dev
```

### API Documentation
Auto-generated Swagger UI: http://localhost:8000/docs

## Deployment on Railway

1. Create a Railway project at railway.app
2. Add PostgreSQL plugin → copy the DATABASE_URL
3. Deploy backend service:
   - Set root directory: `backend`
   - Environment variables: `DATABASE_URL`, `SECRET_KEY`, `FRONTEND_URL`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Deploy frontend service:
   - Set root directory: `frontend`
   - Build command: `npm run build`
   - Environment variable: `VITE_API_URL` = backend Railway URL

Tables are created automatically on first startup via SQLAlchemy.

## Features

### Core Functionality
- **User Authentication**
  - Sign up with email validation
  - Login with JWT token-based authentication
  - Token expiration (7 days by default)
  - Automatic token management in frontend
  - Protected routes with authentication middleware

- **Project Management**
  - Create projects with name and description
  - List all projects the user is a member of
  - View project details with team members
  - Delete projects (Admin only)
  - Automatic project ownership for creators

- **Team Collaboration**
  - Add team members by email
  - Role-based access control (ADMIN/MEMBER)
  - Remove team members (Admin only)
  - View all project members
  - Email-based member identification

- **Task Management**
  - Create tasks with title, description, due date, priority
  - Assign tasks to team members
  - Update task details (title, description, priority, status, assignee)
  - Delete tasks (Admin only)
  - Task priority levels: LOW, MEDIUM, HIGH
  - Due date tracking with overdue highlighting

- **Kanban Board**
  - Visual task organization in 3 columns: TODO, IN PROGRESS, DONE
  - Drag-and-drop status updates via dropdown
  - Color-coded status indicators
  - Priority badges with color coding
  - Overdue task highlighting in red
  - Real-time status updates

- **Dashboard Analytics**
  - Total tasks count across all projects
  - Overdue tasks count
  - Completed tasks count
  - Tasks by status pie chart (TODO/IN_PROGRESS/DONE)
  - Tasks per user bar chart (workload distribution)
  - Real-time data aggregation

- **Role-Based Permissions**
  - **ADMIN**: Full project control
    - Create/delete projects
    - Add/remove team members
    - Create/edit/delete tasks
    - Assign tasks to anyone
    - Update any task's status and details
  - **MEMBER**: Limited access
    - View projects they're members of
    - Update status of assigned tasks only
    - Cannot create/edit/delete tasks
    - Cannot add/remove members

### Technical Features
- **Database**
  - SQLAlchemy ORM for database operations
  - Automatic table creation on startup
  - PostgreSQL for local and production
  - Relationship management (User-Project, Project-Task, etc.)

- **API Architecture**
  - RESTful API design
  - Automatic API documentation with Swagger UI
  - Request/response validation with Pydantic schemas
  - Error handling with appropriate HTTP status codes
  - CORS middleware for frontend-backend communication

- **Frontend Architecture**
  - React 18 with functional components
  - Context API for authentication state management
  - Axios with interceptors for automatic token handling
  - Vite for fast development and optimized builds
  - Tailwind CSS for responsive styling
  - Recharts for data visualization
  - Protected route components

- **State Management**
  - AuthContext for user authentication state
  - Local state for forms and UI components
  - API calls with loading/error states
  - Automatic token refresh handling

## Security Features (Enterprise-Grade)

### Authentication & Authorization
- **JWT Token Authentication**: Secure token-based authentication with configurable expiration
- **Bcrypt Password Hashing**: Industry-standard password hashing with salt
- **Role-Based Access Control**: ADMIN (full access) and MEMBER (limited access) roles
- **Project-Level Isolation**: Users can only access projects they're members of

### Rate Limiting
- **Signup**: 5 requests per minute (prevents automated account creation)
- **Login**: 10 requests per minute (prevents brute force attacks)
- **User Info**: 30 requests per minute
- **Health Check**: 100 requests per minute

### Input Validation & Sanitization
- **Password Strength Requirements**:
  - Minimum 8 characters
  - Maximum 72 characters (bcrypt limit)
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 digit
- **Field Length Limits**:
  - Name: 2-100 characters
  - Project name: 2-200 characters
  - Task title: 2-500 characters
  - Description: Maximum 5000 characters
- **Email Validation**: Using email-validator library

### Security Headers
- **X-Content-Type-Options**: nosniff (prevents MIME type sniffing)
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-XSS-Protection**: 1; mode=block (XSS protection)
- **Strict-Transport-Security**: max-age=31536000; includeSubDomains (HSTS)
- **Content-Security-Policy**: default-src 'self' (CSP)

### HTTPS Enforcement
- Automatic HTTPS redirect in production mode
- Disabled for local development

### Audit Logging
- **Authentication Events**: Logs all signup and login attempts
- **Data Changes**: Logs all POST/PUT/DELETE operations
- **IP Tracking**: Records client IP addresses
- **Performance Metrics**: Logs request duration
- **Log Location**: `security_audit.log` in backend directory

### Trusted Hosts
- Host validation enabled in production
- Prevents host header attacks
- Configured for Railway domains in production

### SQL Injection Protection
- **SQLAlchemy ORM**: Parameterized queries prevent SQL injection
- No raw SQL queries used in the application

### CORS Configuration
- Configured for specific frontend origin
- Credentials allowed for authenticated requests

## Deployment Checklist

### For GitHub (Code Repository)
- [x] All source code committed
- [x] .env files blocked by .gitignore
- [x] .env.example files included as templates
- [x] README.md with complete documentation
- [x] Procfile for Railway deployment included

### For Railway (Production)
- [ ] Connect GitHub repository to Railway
- [ ] Add PostgreSQL plugin to Railway project
- [ ] Set environment variables in Railway dashboard:
  - `DATABASE_URL` (provided automatically by Railway)
  - `SECRET_KEY` (your production secret key)
  - `ENVIRONMENT=production`
  - `FRONTEND_URL` (your Railway frontend URL)
  - `VITE_API_URL` (your Railway backend URL)
  - `ALLOWED_HOSTS` (e.g., *.railway.app)
- [ ] Deploy backend service
- [ ] Deploy frontend service
- [ ] Test deployed application

## How to Use It

### 1. Getting Started
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 2. Account Creation
1. Click "Sign up" on the login page
2. Enter your name, email, and password
3. **Password Requirements**:
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 digit
4. Click "Create Account"

### 3. Creating Projects
1. After login, go to "Projects" page
2. Click "+ New Project" button
3. Enter project name and optional description
4. Click "Create Project"
5. You automatically become the **Admin** of projects you create

### 4. Adding Team Members
1. Open a project you own (as Admin)
2. Click "+ Member" button
3. Enter the email address of an existing user
4. Select role: **ADMIN** (full access) or **MEMBER** (task updates only)
5. Click "Add Member"
6. The member will see this project in their Projects list

### 5. Creating Tasks
1. Open a project
2. Click "+ Task" button
3. Fill in task details:
   - **Title** (required): Task name (2-500 characters)
   - **Description** (optional): Task details (max 5000 characters)
   - **Due Date**: When the task is due
   - **Priority**: LOW, MEDIUM, or HIGH
   - **Assignee**: Select a team member
4. Click "Create Task"

### 6. Managing Tasks (Kanban Board)
Tasks are organized in 3 columns:
- **TODO** (indigo) - New tasks
- **IN PROGRESS** (yellow) - Work in progress
- **DONE** (green) - Completed

**To update task status**:
1. Click on a task card
2. Change the status dropdown
3. Click "Update Task"

**Task Priority Colors**:
- LOW: Gray badge
- MEDIUM: Blue badge
- HIGH: Red badge

**Overdue Tasks**: Highlighted in red if past due date and not done

### 7. Role Permissions

**Admin** (Project Creator):
- Create projects
- Add/remove team members
- Create/edit/delete tasks
- Assign tasks to anyone
- Change any task's status and details

**Member** (Added to project):
- View projects they're members of
- Update status of assigned tasks only
- Cannot create/edit/delete tasks
- Cannot add/remove members

### 8. Dashboard Analytics
The Dashboard provides insights across all your projects:
- **Total Tasks**: All tasks across your projects
- **Overdue Tasks**: Tasks past due date (not done)
- **Completed Tasks**: Tasks with DONE status

**Charts**:
1. **Tasks by Status** (Pie Chart)
   - Visual breakdown of TODO/IN_PROGRESS/DONE
   - Color-coded for quick scanning

2. **Tasks per User** (Bar Chart)
   - Shows workload distribution
   - Identifies who has most assigned tasks

### 9. Navigation
- **Dashboard**: High-level analytics and overview
- **Projects**: List and manage all your projects
- **Project Detail**: Kanban board, team members, task management
- **Logout**: Sign out (clears token)

### 10. Security Features in Action
- **Rate Limiting**: Try to signup/login rapidly - you'll hit limits
- **Password Validation**: Weak passwords will be rejected
- **Input Limits**: Long inputs will be rejected
- **Audit Logs**: Check `backend/security_audit.log` for activity logs
- **Security Headers**: Check browser network tab for security headers

### 11. Common Issues

**Signup Failed**:
- Ensure password meets requirements (8+ chars, uppercase, lowercase, digit)
- Check if email already registered

**Can't Add Member**:
- Member must have signed up first
- Email must be exact match

**Task Not Updating**:
- Members can only update status of assigned tasks
- Admins can update any task

**Rate Limit Error**:
- Wait a minute before trying again
- This protects against brute force attacks

### 12. Testing Security Features
To demonstrate security features for recruitment:

**Test Rate Limiting**:
```bash
# Try rapid signup attempts - will be limited after 5/minute
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test1234"}'
```

**Test Password Validation**:
- Try signing up with weak password (e.g., "password")
- Try signing up with strong password (e.g., "SecurePass123")

**Check Security Headers**:
```bash
curl -I http://localhost:8000/health
# You'll see: X-Content-Type-Options, X-Frame-Options, etc.
```

**View Audit Logs**:
```bash
# Check backend/security_audit.log
tail -f backend/security_audit.log
```

## Current Status

**Local Development**:
- ✓ Backend running on http://localhost:8000
- ✓ Frontend running on http://localhost:5173
- ✓ PostgreSQL database configured
- ✓ All security features active

**Production Deployment**:
- Ready for Railway deployment
- Follow deployment checklist above

## Project Structure

```
team-task-manager/
├── backend/
│   ├── app/
│   │   ├── auth.py          # JWT & password hashing
│   │   ├── database.py      # Database connection (PostgreSQL)
│   │   ├── main.py          # FastAPI app with security middleware
│   │   ├── models.py        # SQLAlchemy ORM models
│   │   ├── schemas.py       # Pydantic validation with security rules
│   │   └── routers/         # API endpoints with rate limiting
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables (local)
│   ├── .env.example         # Template for GitHub
│   ├── Procfile             # Railway deployment config
│   └── security_audit.log   # Security event logs
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios with auth interceptor
│   │   ├── components/      # React components
│   │   ├── context/         # Auth context
│   │   └── pages/           # Page components
│   ├── package.json         # Node dependencies
│   ├── vite.config.js       # Vite configuration
│   ├── .env                 # Environment variables (local)
│   └── .env.example         # Template for GitHub
├── .gitignore               # Blocks .env files
└── README.md                # This file
```
