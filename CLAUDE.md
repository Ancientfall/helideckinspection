# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm start          # Start development server on http://localhost:3000
npm run build      # Create production build in /build directory
npm test           # Run tests in watch mode (Jest)
```

### Common Tasks
```bash
npm install        # Install all dependencies
npm install uuid   # Fix missing uuid dependency for NewInspection.jsx
```

## Architecture

This is a React SPA for tracking helideck inspections across offshore facilities. The app uses a backend Node.js + SQLite.

### Core Data Flow
1. All inspection data is stored in localStorage under the key 'helideckInspections'
2. Facilities are predefined in `utils/facilities.js` (9 offshore platforms)
3. Inspection status is calculated based on days since last inspection (180-day cycle)
4. Status indicators use color-coding: green (< 90 days) → yellow → orange → red (≥ 180 days)

### Key Dependencies
- React Router DOM for navigation
- Tailwind CSS for styling (configured in `tailwind.config.js`)
- Recharts for the status pie chart visualization
- date-fns for date calculations and formatting

### Important Implementation Details
- The app expects inspection dates in ISO format
- File attachments are stored as base64 strings in localStorage
- Status calculations happen in `utils/dateUtils.js` using a 180-day inspection cycle
- All facilities have unique IDs that match their names (e.g., "Atlantis", "Argos")

### Current Issues
- Missing uuid dependency (imported in NewInspection.jsx but not installed)
- Both App.js and App.jsx exist - only App.jsx is used
- Mixed build tool configuration (Vite config present but using Create React App)