# Setup Instructions - SLIIT Smart Gym Management System

## Prerequisites

Ensure you have the following installed:

- Node.js (v18 or higher) - [Download](https://nodejs.org/)
- MongoDB (local installation or MongoDB Atlas account) - [Download](https://www.mongodb.com/try/download/community)
- Git - [Download](https://git-scm.com/)
- Code Editor (VS Code recommended)

## Step-by-Step Setup

### 1. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 2. Environment Configuration

#### Backend Environment

1. Navigate to `backend/` folder
2. Copy `.env.example` to `.env`
3. Update the following variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong secret key for JWT
   - `PORT`: Backend port (default 5000)

#### Frontend Environment

1. Navigate to `frontend/` folder
2. Copy `.env.example` to `.env`
3. Update `VITE_API_URL` if your backend runs on a different URL

### 3. Database Setup

#### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/smart-gym`

#### Option B: MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string and update in backend `.env`

### 4. Running the Application

#### Start Backend (Port 5000)

```bash
cd backend
npm run dev
```

#### Start Frontend (Port 5173)

Open a new terminal:

```bash
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure Overview

```
Smart-Gym/
├── backend/
│   ├── config/          # DB and app configuration
│   ├── controllers/     # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, validation, etc.
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── services/    # API integration
│   │   ├── context/     # State management
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Helper functions
│   └── public/          # Static files
│
└── README.md
```

## Next Steps

Now you're ready to start development! Begin by:

1. Creating your database models in `backend/models/`
2. Setting up routes in `backend/routes/`
3. Creating controllers in `backend/controllers/`
4. Building UI components in `frontend/src/components/`
5. Creating pages in `frontend/src/pages/`

## Troubleshooting

### Port Already in Use

- Backend: Change `PORT` in backend `.env`
- Frontend: Change port in `vite.config.js`

### Database Connection Error

- Verify MongoDB is running
- Check connection string in `.env`
- Ensure network access is allowed (for Atlas)

### Module Not Found

- Delete `node_modules` folder
- Run `npm install` again

## Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/)
