# Alumni Association Platform - Backend

## Project Overview
A comprehensive platform for managing alumni relations, job postings, donations, and events. This backend system provides RESTful APIs to support the alumni association's web application.

## Current Progress

### ✅ Completed Features

#### User Management
- [x] User registration and authentication
- [x] Profile management
- [x] Role-based access control (Admin/User)
- [x] Password reset functionality
- [x] Email verification

#### Job Portal
- [x] Job posting creation and management
- [x] Advanced job search with filters
- [x] Job application tracking
- [x] Company and location-based filtering
- [x] Job status management (active/closed/expired)

#### Donation System
- [x] Razorpay integration for payments
- [x] Anonymous donation support
- [x] Donation progress tracking
- [x] Donation history
- [x] Payment verification
- [x] Donation receipts

### 🚧 In Progress

#### Event Management
- [ ] Event creation and management
- [ ] Event registration
- [ ] Attendance tracking
- [ ] Event categories
- [ ] Event reminders

#### Community Features
- [ ] Alumni directory
- [ ] Networking opportunities
- [ ] Mentorship program
- [ ] Discussion forums
- [ ] Success stories sharing

### 📋 Planned Features

#### Content Management
- [ ] News and announcements
- [ ] Newsletter system
- [ ] Blog/Article publishing
- [ ] Media gallery

#### Analytics & Reporting
- [ ] Donation analytics
- [ ] Event participation metrics
- [ ] Job placement statistics
- [ ] User engagement metrics

## API Documentation

### Authentication Endpoints
\`\`\`
POST /api/auth/register - Register new user
POST /api/auth/login - User login
POST /api/auth/forgot-password - Password reset request
POST /api/auth/reset-password - Reset password
GET /api/auth/verify-email - Verify email
\`\`\`

### Profile Endpoints
\`\`\`
GET /api/profile/me - Get current user profile
PUT /api/profile/me - Update user profile
GET /api/profile/:id - Get user profile by ID
GET /api/profile/search - Search alumni profiles
\`\`\`

### Job Portal Endpoints
\`\`\`
POST /api/jobs - Create new job posting
GET /api/jobs - Get all job postings
GET /api/jobs/:id - Get specific job posting
PUT /api/jobs/:id - Update job posting
DELETE /api/jobs/:id - Delete job posting
\`\`\`

### Donation Endpoints
\`\`\`
POST /api/donations/create-order - Create donation order
POST /api/donations/verify-payment - Verify payment
GET /api/donations/progress - Get donation progress
GET /api/donations/history - Get donation history
GET /api/donations/my-donations - Get user's donations
\`\`\`

## Technical Stack

### Core Technologies
- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)

### Integrations
- Razorpay Payment Gateway
- Email Service (Nodemailer)
- Cloud Storage (planned)

### Security Features
- JWT Authentication
- Request Rate Limiting
- Input Validation
- XSS Protection
- CORS Configuration

## Setup Instructions

1. Clone the repository
\`\`\`bash
git clone [repository-url]
cd alumni-association-backend
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Configure environment variables
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Start the server
\`\`\`bash
# Development
npm run dev

# Production
npm start
\`\`\`

## Environment Variables Required
\`\`\`
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=your_mongodb_uri

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_email_password

# Frontend URLs
FRONTEND_URL=http://localhost:3000
PRODUCTION_URL=https://your-production-url.com
\`\`\`

## Database Schema Progress

### Completed Schemas
- [x] User Schema
- [x] Job Posting Schema
- [x] Donation Schema

### Pending Schemas
- [ ] Event Schema
- [ ] Forum Post Schema
- [ ] Comment Schema
- [ ] Newsletter Schema

## Testing

### Implemented Tests
- [x] Authentication Routes
- [x] User Profile Routes
- [x] Job Posting Routes
- [x] Donation Routes

### Pending Tests
- [ ] Event Routes
- [ ] Forum Routes
- [ ] Integration Tests
- [ ] Load Tests

## Deployment

### Current Status
- [x] Development Environment Setup
- [x] Basic CI/CD Pipeline
- [x] Vercel Deployment
- [ ] Production Environment Setup
- [ ] Load Balancing
- [ ] CDN Integration

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details

