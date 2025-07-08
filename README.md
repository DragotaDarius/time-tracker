# TimeTracker - Multi-User Time Tracking App

A scalable multi-user time tracking application built with Next.js 14+, Supabase, and modern web technologies.

## 🚀 MVP Features

### ✅ Completed Features

**Authentication & Organization**
- User signup/login with email/password
- Organization creation on signup
- Multi-tenant architecture with JWT claims
- Secure RLS policies

**User Management**
- List users in the current organization
- User roles (admin, member)
- User profiles with avatars

**Project Management**
- Create and manage projects
- Project details (name, description, client, hourly rate, budget)
- Project status tracking

**Time Tracking**
- Clock in/out functionality
- Active session tracking with real-time duration
- Session history with project assignment
- Today's hours calculation

**Dashboard**
- Overview of current session
- Today's tracked hours
- Recent sessions list
- Quick actions for navigation

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React icons
- **State Management**: React hooks, Zustand (ready for implementation)
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with custom JWT claims

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd time-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/`
   - Update your environment variables with the project credentials

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Getting Started

1. **Sign Up**: Create a new account and organization
2. **Login**: Access your dashboard
3. **Create Projects**: Add projects to track time against
4. **Start Tracking**: Use the clock in/out buttons on the dashboard
5. **View History**: Check your recent sessions and time summaries

### Key Features

**Dashboard**
- View today's hours and current session status
- Quick access to start/stop time tracking
- Overview of recent activity

**Projects**
- Create new projects with details
- Set hourly rates and budgets
- Track time against specific projects

**Team Management**
- View organization members
- See user roles and join dates
- Team overview statistics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/session` - Get current session

### Users
- `GET /api/users` - List organization users

### Projects
- `GET /api/projects` - List organization projects
- `POST /api/projects` - Create new project

### Time Tracking
- `POST /api/time/clock-in` - Start work session
- `POST /api/time/clock-out` - End work session
- `GET /api/time/sessions` - List user sessions
- `GET /api/time/current-session` - Get active session

## 🏗 Architecture

### Database Schema
- **organizations**: Multi-tenant organizations
- **user_profiles**: User profiles with organization association
- **projects**: Projects within organizations
- **work_sessions**: Time tracking sessions
- **breaks**: Break tracking (ready for implementation)

### Security
- Row Level Security (RLS) policies
- JWT custom claims for organization_id
- Service role for privileged operations
- Input validation with Zod

### Frontend Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── projects/          # Projects page
│   ├── users/             # Users page
│   └── auth/              # Auth pages
├── components/            # Reusable components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
└── types/                 # TypeScript types
```

## 🚧 Next Steps (Future Features)

- [ ] Break tracking functionality
- [ ] Google Calendar integration
- [ ] Advanced reporting and analytics
- [ ] Team management features
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Email notifications
- [ ] Export functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.
