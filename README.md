# Radius - AI-Powered Lead Generation Platform

A modern, intelligent lead generation platform that leverages web scraping, AI-powered interview preparation, and analytics to help you identify, qualify, and convert high-quality job candidates.

## 🚀 Features

### Smart Job Scraping
- Automatically scrape job listings from multiple sources
- Extract and organize job data with intelligent parsing
- Real-time job market insights and trends

### AI Interview Prep Guides
- Generate personalized interview preparation guides powered by AI
- Covers technical topics, coding, system design, and behavioral questions
- Company-specific tips and insights
- Focus areas tailored to the job role

### Lead Management
- Centralized lead database with detailed profiles
- Track lead status and conversion funnel
- Email and meeting scheduling directly from the platform
- Job application history and notes

### Analytics Dashboard
- Track conversion rates and key metrics
- Monitor lead sources and performance
- Visual analytics for data-driven decisions
- Real-time statistics on leads and jobs

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **CVA (Class Variance Authority)** - Component variants
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance
- Git

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/radius.git
cd radius
```

### 2. Install dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 3. Environment Setup

Create `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Create `.env.local` file in the `client` directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Run the application

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## 📚 Project Structure

```
LeadGen/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # Context for state management
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                # Node/Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   └── server.js         # Entry point
└── README.md
```

## 🔐 Authentication

Radius uses JWT-based authentication with secure password handling:
- Users create an account and log in
- JWT tokens are issued upon successful authentication
- Protected routes require valid JWT tokens
- Tokens are stored securely in local storage

## 🎯 Key Components

### LandingPage
- Beautiful hero section with smooth animations
- Features overview
- How it works explanation
- Responsive design

### Dashboard
- Centralized hub for all platform features
- Quick stats (converted leads, success rate)
- Navigation to all major features

### LeadDetailPanel
- Detailed lead information
- Job role selection and details
- AI interview preparation access
- Email and meeting scheduling

### PrepGuide
- AI-generated interview preparation guide
- Organized sections (Technical, Coding, System Design, Behavioral)
- Company-specific tips
- Collapsible sections for easy navigation

### Analytics
- Real-time performance metrics
- Conversion funnel visualization
- Source performance analysis

## 🚀 Getting Started

1. Sign up for a free account
2. Create a new scraping job for your target companies
3. Wait for job listings to be collected
4. Review and manage leads
5. Generate AI interview prep guides
6. Track conversions and metrics

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new scraping job
- `GET /api/jobs/:id` - Get job details
- `DELETE /api/jobs/:id` - Delete job

### Leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get lead details
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Analytics
- `GET /api/analytics/stats` - Get dashboard statistics
- `GET /api/analytics/conversion` - Get conversion data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## 🙏 Acknowledgments

- Built with React and modern web technologies
- UI components inspired by Apple's design principles
- Special thanks to the open-source community

---


