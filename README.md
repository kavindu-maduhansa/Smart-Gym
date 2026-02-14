# SLIIT Smart Gym Management System

A comprehensive gym management system built with the MERN stack.

## Tech Stack

### Frontend

- React 18
- Vite
- React Router DOM
- Axios

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication

## Project Structure

```
Smart-Gym/
├── backend/          # Express.js backend
├── frontend/         # React (Vite) frontend
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/kavindu-maduhansa/Smart-Gym.git
cd Smart-Gym
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### Environment Variables

Create `.env` files in both frontend and backend directories. See `.env.example` files for required variables.

### Running the Application

#### Backend

```bash
cd backend
npm run dev
```

#### Frontend

```bash
cd frontend
npm run dev
```

## Features

- User Management
- Membership Management
- Trainer Management
- Class Scheduling
- Payment Processing
- Reports and Analytics

## License

MIT
