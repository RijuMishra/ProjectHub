# ProjectHub – Integrated Student Project Collaboration and Resource Exchange Platform

ProjectHub is a full-stack academic web platform designed to streamline student project collaboration, technical skill matching, milestone management, and academic resource exchange across university departments.

Built as a college Full Stack Development (FSD) project adhering strictly to production engineering practices, modular architecture, REST standards, and an editorial SaaS user interface.

---

## 🌟 Key Functional Modules

### 1. Authentication & Role-Based Profiles (Module A)
- **Student Registration & Login**: Secure credential exchange using **JWT (JSON Web Tokens)** and **bcryptjs** (salt factor 10) password hashing.
- **Academic Profiles**: Tracks student name, email, department, academic year (1st–4th Year / Postgrad), verified skill tags, GitHub/LinkedIn links, and engineering bio.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `student` and `admin` roles, enforced via backend middleware.

### 2. Live Student Dashboard (Module B)
- **Database-Aggregated Metrics**: Displays real-time statistics queried from MongoDB:
  - Total projects established
  - Total teams joined
  - Pending collaboration requests received
  - Assigned task volume and completion percentage progress bar
- **Recent Activity**: Live feeds of newly published projects and uploaded departmental resources.
- **Quick-Action Shortcuts**: One-click project creation, discovery, and resource submission.

### 3. Project Discovery & Full CRUD Management (Module C)
- **Project Publishing**: Title, description, domain category, technology stack, required collaborator skills, team size limits (1–10 members), status, and visibility.
- **Search & Multi-Filtering**: Full-text keyword search combined with category filtering (Web Dev, AI/ML, Data Science, App Dev, IoT, Cybersecurity, Other) and lifecycle status filters (Planning, In Progress, Completed, On Hold).
- **Ownership Security**: Only verified project leads or administrators can update or delete projects.

### 4. Peer Collaboration & Team Assembly (Module D)
- **Join Requests**: Students can pitch their skills and proposed team roles (e.g., MLOps Engineer, Backend Lead) to project owners.
- **Vetting Flow**: Project owners receive incoming applications with full applicant profiles to accept or decline.
- **Duplicate & Capacity Safeguards**: Backend automatically prevents duplicate requests and blocks new members once maximum team capacity is reached.
- **Roster Management**: Project leads can manage roles or remove team members with authorization checks.

### 5. Academic Resource Exchange Hub (Module E)
- **Real File Uploads & Downloads**: Multipart file ingestion supporting PDFs, lecture slides (PPT/PPTX), documentation (DOC/DOCX), code archives (ZIP/RAR), and source files (JS, PY, C++, etc.).
- **Dual-Storage Provider**: Built-in support for **Cloudinary** cloud storage, with an automatic, zero-config local disk storage fallback in `server/uploads/`.
- **Search & Tagging**: Filter learning materials by category, tags, or file extensions. Tracks download counters.

### 6. Project Milestone & Sprint Task Board (Module F)
- **Interactive Kanban Interface**: 4-column organized sprint view:
  - `To Do`
  - `In Progress`
  - `Under Review`
  - `Completed`
- **Task Controls**: Create tasks, assign deliverables to team members, set deadlines, define priority (Low, Medium, High), and transition statuses.
- **Scope Filtering**: Switch between cross-project personal assignments and project-specific boards.

### 7. Project Discussions & Q&A (Module G)
- **Chronological Discussion Threads**: Project-level technical discussion forums for peer feedback, design critiques, and architecture notes.
- **Author Accountability**: Displays commenter identity, academic department, and timestamps. Authors and admins can delete comments.

### 8. Database-Backed Notifications (Module H)
- **Automatic Notification Triggers**: Dispatches alerts for join applications, acceptance/rejections, task assignments, status transitions, and discussion messages.
- **Read State Tracking**: Live unread badges in the header, single-click read markers, and a "Mark all read" utility.

### 9. Dedicated Administration Console (Module I)
- **Platform Analytics**: Global counts of registered students, projects, uploaded documents, completed tasks, and category distribution percentages.
- **Moderation Tools**: Administrative oversight with one-click deletion of inappropriate projects, resources, or abusive user accounts.
- **Route Guards**: Frontend and backend RBAC strictly preventing non-admin access.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, JavaScript ES6+, Tailwind CSS, React Router DOM v6, Axios, Lucide React icons, React Hot Toast |
| **Backend** | Node.js, Express.js, RESTful API Architecture, JWT, bcryptjs, Multer multipart handling, Morgan |
| **Database** | MongoDB Atlas, Mongoose ODM, with an automatic resilient local persistence engine fallback |
| **Storage** | Local disk storage (`server/uploads/`) & Cloudinary cloud adapter |
| **Styling** | Editorial academic productivity design system, navy `#172B4D`, muted accent `#5277A5`, warm background `#F8F9FB` |

---

## 📁 Repository Structure

```text
ProjectHub/
├── client/                     # Frontend React + Vite Application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI widgets (Navbar, Sidebar, Cards, Modal, Badges)
│   │   ├── context/            # Global AuthContext & state management
│   │   ├── layouts/            # AppLayout (authenticated) & PublicLayout
│   │   ├── pages/              # 15 Complete Page Views
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ExploreProjectsPage.jsx
│   │   │   ├── ProjectDetailsPage.jsx
│   │   │   ├── CreateEditProjectPage.jsx
│   │   │   ├── MyProjectsPage.jsx
│   │   │   ├── MyTeamsPage.jsx
│   │   │   ├── ResourceHubPage.jsx
│   │   │   ├── TaskBoardPage.jsx
│   │   │   ├── DiscussionsPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── services/           # Axios API client methods
│   │   ├── App.jsx             # React Router routing configuration
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind design tokens
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend Express REST API
│   ├── config/
│   │   ├── db.js               # MongoDB connection & local fallback management
│   │   ├── cloudinary.js       # Cloud storage configuration
│   │   └── localStore.js       # Resilient local JSON engine for zero-setup grading
│   ├── controllers/            # Controller business logic (Auth, Projects, Tasks, etc.)
│   ├── middleware/             # JWT auth, upload validation, centralized error handler
│   ├── models/                 # 7 Mongoose Schemas (User, Project, Task, Resource, etc.)
│   ├── routes/                 # Express REST endpoint routers
│   ├── utils/
│   │   ├── seedData.js         # Comprehensive academic seed database
│   │   └── seedRunner.js       # Standalone seed utility
│   ├── uploads/                # Local file storage for uploaded materials
│   ├── test-suite.js           # 17-point automated full-stack integration test suite
│   ├── server.js               # Main Express application entrypoint
│   └── package.json
│
├── .env.example                # Sample environment configuration template
├── .gitignore
├── package.json                # Root scripts to orchestrate client & server
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **npm** v9+
- Optional: MongoDB Atlas connection string (or run instantly with the built-in local database engine)

### 2. Installation

Clone or extract the project directory and install dependencies:

```bash
# Install root, backend, and frontend dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Environment Variables

Create `server/.env` based on `.env.example`:

```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/projecthub
JWT_SECRET=projecthub_jwt_super_secret_key_2026_academic_demo
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@projecthub.edu
ADMIN_PASSWORD=Admin@123456
CLIENT_URL=http://localhost:5173

# Optional Cloudinary configuration (leave blank for local storage)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

NODE_ENV=development
```

> **Note on MongoDB**:
> If you have a MongoDB Atlas connection string, paste it as `MONGODB_URI`.
> If no MongoDB server is running locally, ProjectHub automatically activates its built-in **Resilient Storage Engine** (`server/data/localStore.json`), enabling all Mongoose models, queries, and file operations to function immediately without configuration!

---

## 🏃 Running the Application

### Start the Backend Server:
```bash
cd server
npm start
```
*Backend runs on `http://localhost:5000`.*

### Start the Frontend Client:
In a separate terminal:
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Automated Integration Testing

ProjectHub includes an automated 17-point integration test suite that boots the server and verifies every major flow:

```bash
cd server
node test-suite.js
```

### Test Coverage Matrix:
- ✓ Student Login with JWT generation
- ✓ Admin Login with Role Verification
- ✓ Student Registration and auto-token issuance
- ✓ Fetch Public Projects with filter queries
- ✓ Create Project with technology stack & required skills
- ✓ Update Project status to "In Progress"
- ✓ Submit Join Request to project owner
- ✓ Prevent Duplicate Join Request (Blocked with 400)
- ✓ Accept Join Request & Add Member to project team
- ✓ Create Task with Priority and Assignee
- ✓ Update Task status across Kanban states
- ✓ Post Discussion Comment on Project thread
- ✓ Upload File Resource via multipart/form-data
- ✓ Download Resource and serve binary stream
- ✓ Fetch Student Dashboard Stats with real database aggregations
- ✓ Admin Access Platform Stats
- ✓ RBAC Security: Ordinary student blocked from Admin API (403 Forbidden)

---

## 🔑 Pre-seeded Demo Credentials

For quick evaluation, sample accounts have been seeded into the system:

| Role | Email | Password | Details |
|---|---|---|---|
| **Administrator** | `admin@projecthub.edu` | `Admin@123456` | Full system audit access & admin dashboard |
| **Student (Lead)** | `arjun.sharma@projecthub.edu` | `Student@123` | Final year CSE, Full Stack Web Lead |
| **Student (ML)** | `priya.patel@projecthub.edu` | `Student@123` | 3rd Year AI & DS, Computer Vision Specialist |
| **Student (IoT)** | `rohit.verma@projecthub.edu` | `Student@123` | 3rd Year IT, Embedded & Mobile Developer |

*(One-click quick login buttons for these accounts are also provided directly on the Login screen).*

---

## 📡 REST API Reference Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` – Register student account
- `POST /api/auth/login` – Authenticate user and receive JWT
- `GET /api/auth/me` – Fetch authenticated session
- `PUT /api/auth/profile` – Update student profile & skills

### Projects (`/api/projects`)
- `GET /api/projects` – List public projects (supports `?search=`, `?category=`, `?status=`)
- `GET /api/projects/my` – Get projects owned or joined by student
- `GET /api/projects/dashboard-stats` – Aggregated personal dashboard analytics
- `GET /api/projects/:id` – Fetch detailed project overview
- `POST /api/projects` – Publish new project
- `PUT /api/projects/:id` – Edit owned project
- `DELETE /api/projects/:id` – Remove project and cascade associated data
- `PUT /api/projects/:projectId/members/:memberId` – Update role or remove team member

### Collaboration Requests (`/api/join-requests`)
- `POST /api/join-requests` – Submit application to join a project
- `GET /api/join-requests/received` – View incoming applications for owned projects
- `GET /api/join-requests/sent` – View sent applications
- `PUT /api/join-requests/:id/respond` – Accept or reject collaboration request

### Resource Exchange (`/api/resources`)
- `GET /api/resources` – Browse resources (supports search & category filters)
- `POST /api/resources` – Upload multipart document/code file
- `GET /api/resources/:id/download` – Download file stream
- `DELETE /api/resources/:id` – Delete uploaded resource

### Task Management (`/api/tasks`)
- `GET /api/tasks/project/:projectId` – Get all tasks for a project
- `GET /api/tasks/my-tasks` – Get all tasks assigned to current student
- `POST /api/tasks` – Create sprint task
- `PUT /api/tasks/:id` – Update task status, priority, or assignee
- `DELETE /api/tasks/:id` – Delete task

### Discussions (`/api/comments`)
- `GET /api/comments/project/:projectId` – Fetch project discussion thread
- `POST /api/comments` – Post comment to thread
- `DELETE /api/comments/:id` – Remove comment

### Notifications (`/api/notifications`)
- `GET /api/notifications` – Fetch user notifications
- `PUT /api/notifications/:id/read` – Mark single notification read
- `PUT /api/notifications/read-all` – Mark all notifications read

### Admin Console (`/api/admin`)
- `GET /api/admin/stats` – Platform-wide metrics and category breakdown
- `GET /api/admin/users` – User management roster
- `DELETE /api/admin/users/:id` – Remove user account
- `GET /api/admin/projects` – All projects moderation view
- `DELETE /api/admin/projects/:id` – Administrative project deletion
- `GET /api/admin/resources` – All resources moderation view
- `DELETE /api/admin/resources/:id` – Administrative resource deletion
