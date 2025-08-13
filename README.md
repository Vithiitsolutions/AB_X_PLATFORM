# MercuryX Platform - Node.js Version

A React Router + Express application for the MercuryX platform, converted from Deno to Node.js.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB
- Redis (optional)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database URLs and other configuration.

3. **Build the application:**
   ```bash
   npm run build
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run typecheck` - Run TypeScript type checking

## Environment Variables

- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (default: 3000)
- `DB_URL` - MongoDB connection string
- `REDIS_URL` - Redis connection string (optional)
- `JWT_SECRET` - Secret key for JWT tokens

## Architecture

- **Frontend**: React with React Router v7
- **Backend**: Express.js with GraphQL (Apollo Server)
- **Database**: MongoDB with Mercury metadata API
- **Build**: Vite with React Router integration
- **Styling**: TailwindCSS with Chakra UI components

## Migration from Deno

This project was converted from Deno to Node.js with the following changes:

- Removed `deno.json` and `deno.lock`
- Updated `package.json` scripts to use npm/npx
- Replaced `Deno.env.get()` with `process.env`
- Added `dotenv` for environment variable management
- Removed Deno-specific vite plugin
- Updated TypeScript configuration for Node.js
- Added proper Node.js type declarations
