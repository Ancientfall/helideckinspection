# Helideck Inspection Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm install -g nodemon
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Inspections
- GET `/api/inspections` - Get all inspections (requires auth)
- GET `/api/inspections/:id` - Get specific inspection (requires auth)
- POST `/api/inspections` - Create new inspection (requires auth, supports file uploads)
- PUT `/api/inspections/:id` - Update inspection (requires auth)
- DELETE `/api/inspections/:id` - Delete inspection (requires auth)

### Facilities
- GET `/api/facilities` - Get all facilities (requires auth)
- GET `/api/facilities/:id` - Get specific facility (requires auth)

## Environment Variables

Create a `.env` file:
```
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
NODE_ENV=development
```

## Database

SQLite database will be created automatically at `./database.sqlite` on first run.