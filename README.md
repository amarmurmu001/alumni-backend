# Backend

This is the backend part of our project.

## Prerequisites

- Node.js (v14 or later recommended)
- npm (usually comes with Node.js)
- Git

## Setup

1. Clone the repository:
   ```bash
   https://github.com/amarmurmu001/alumni-backend.git
   ```

2. Navigate to the backend folder:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your local configuration.
   

# Environment variables
NEXT_PUBLIC_API_URL=http://localhost:5000

# Server configuration
PORT=5000

# MongoDB connection string
MONGODB_URI=your_mongodb_uri_here

# JWT secret key
JWT_SECRET=your_jwt_secret_here

## Running the server

To start the development server:
```bash
npm start
```

The server will run on `http://localhost:5000`.

