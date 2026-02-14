# SLIIT Smart Gym Management System - Frontend

React frontend application built with Vite.

## Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── assets/      # Images, fonts, etc.
│   ├── components/  # Reusable components
│   ├── context/     # React context providers
│   ├── hooks/       # Custom React hooks
│   ├── pages/       # Page components
│   ├── services/    # API services
│   ├── utils/       # Utility functions
│   ├── App.jsx      # Root component
│   ├── main.jsx     # Entry point
│   └── index.css    # Global styles
├── index.html       # HTML template
├── vite.config.js   # Vite configuration
└── package.json     # Dependencies
```

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`
2. Update `VITE_API_URL` with your backend URL

## Running

Development mode:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Features

- Modern React 18 with Hooks
- Vite for fast development
- React Router for navigation
- Axios for API calls
