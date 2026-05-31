# Chattera

A full-stack social media platform built with the MERN stack.
Users can post "chatts", like them, and customise their profiles.

## Tech Stack

- **Frontend** — React, Vite, React Router, Axios
- **Backend** — Node.js, Express, MongoDB, Mongoose
- **Auth** — JWT, Google OAuth
- **Media** — Cloudinary
- **Styling** — Custom CSS with dark/light theme

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Google Cloud OAuth credentials

### Installation

1. Clone the repo

   \`\`\`bash
   git clone https://github.com/AryanTariq/chattera.git
   cd chattera
   \`\`\`

2. Install server dependencies

   \`\`\`bash
   cd server
   npm install
   \`\`\`

3. Install client dependencies

   \`\`\`bash
   cd ../client
   npm install
   \`\`\`

4. Set up environment variables (see below)

5. Run the app

   \`\`\`bash
   # In /server
   npm run dev

   # In /client
   npm run dev
   \`\`\`

## Environment Variables

### Server `/server/.env`

\`\`\`
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
\`\`\`

### Client `/client/.env`

\`\`\`
VITE_API_URL=http://localhost:5000
\`\`\`

## Project Structure

\`\`\`
chattera/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── css/             # Stylesheets
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   └── utils/           # Helper functions
│   └── public/              # Static assets
└── server/
    ├── config/              # DB and Cloudinary config
    ├── controllers/         # Route handlers
    ├── middleware/          # Auth and error middleware
    ├── models/              # Mongoose schemas
    ├── routes/              # Express routes
    └── utils/               # Helper functions
\`\`\`

## Features

- Sign up / log in with email or Google OAuth
- Post, edit, delete chatts (text + images/videos)
- Like and unlike chatts
- User profiles with avatar, banner, bio
- Light and dark mode
- Responsive design
\`\`\`