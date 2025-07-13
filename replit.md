# Ontdek Polen - Polish Travel Website

## Overview

This is a full-stack web application for discovering beautiful places in Poland. It's a travel website that showcases Polish destinations, travel guides, and provides information about various locations throughout the country. The application is built with a modern tech stack using React for the frontend and Express for the backend.

**Latest Update (2025-01-13)**: 
- Added comprehensive CMS with command-line interface for content management
- Implemented multi-user authentication system with role-based permissions
- Connected Neon PostgreSQL database for secure user management
- Created web-based admin interface with user management capabilities

## User Preferences

Preferred communication style: Simple, everyday language.
Language: Dutch (Nederlands) - User prefers communication in Dutch.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS for styling with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript (ESM modules)
- **Database**: Configured for PostgreSQL with Neon Database serverless
- **ORM**: Drizzle ORM for database operations
- **Session Management**: PostgreSQL session storage with connect-pg-simple

### Development Setup
- **Monorepo Structure**: Shared code between client and server
- **Hot Reload**: Vite dev server with HMR
- **Error Handling**: Runtime error overlay for development
- **Build Process**: Separate build steps for client (Vite) and server (esbuild)

## Key Components

### Directory Structure
```
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/ui/  # shadcn/ui components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utility functions
│   │   ├── hooks/         # Custom React hooks
│   │   └── data/          # Generated data files from CMS
├── server/          # Express backend application
│   ├── index.ts     # Main server entry point
│   ├── routes.ts    # API route definitions
│   ├── storage.ts   # Data storage interface
│   └── vite.ts      # Vite integration for development
├── shared/          # Code shared between client and server
│   └── schema.ts    # Database schema and validation
├── content/         # CMS content storage
│   ├── destinations/  # Destination JSON files
│   └── guides/       # Travel guide JSON files
├── cms/             # Content Management System
│   └── cli.js       # Command-line interface
└── migrations/      # Database migration files
```

### CMS System
- **Content Storage**: JSON files in `content/` directory
- **CLI Interface**: `cms/cli.js` for content management
- **Auto-generation**: TypeScript data files created from JSON
- **Commands**: `new:destination`, `new:guide`, `list`, `generate`, `build`

### Data Models
- **Users**: Basic user management with username/password authentication
- **Schema**: Defined using Drizzle ORM with Zod validation schemas

### UI Components
- Modern, accessible component library based on Radix UI primitives
- Consistent design system with CSS variables for theming
- Responsive design with mobile-first approach
- Dutch language interface for Polish travel content

## Data Flow

### Client-Server Communication
1. **API Layer**: RESTful API endpoints under `/api` prefix
2. **Query Management**: TanStack Query handles caching, synchronization, and error states
3. **Form Handling**: React Hook Form with Zod validation for client-side validation
4. **Error Handling**: Centralized error handling with toast notifications

### Database Operations
1. **Storage Interface**: Abstract storage layer with in-memory implementation for development
2. **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
3. **Migrations**: Database schema versioning through Drizzle Kit

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database
- **Connection**: Environment variable `DATABASE_URL` required

### UI Libraries
- **Radix UI**: Primitive components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Tools
- **Replit Integration**: Development environment with cartographer plugin
- **ESBuild**: Fast JavaScript bundler for server code
- **TypeScript**: Type safety across the entire application

## Deployment Strategy

### Build Process
1. **Client Build**: Vite builds React app to `dist/public`
2. **Server Build**: ESBuild bundles server code to `dist/index.js`
3. **Static Assets**: Client build output served as static files

### Production Configuration
- **Environment**: `NODE_ENV=production`
- **Database**: PostgreSQL connection via `DATABASE_URL`
- **Static Serving**: Express serves built client files
- **Session Storage**: PostgreSQL-backed sessions for scalability

### Development vs Production
- **Development**: Vite dev server with HMR, in-memory storage
- **Production**: Static file serving, database-backed storage
- **Database**: Same PostgreSQL setup for both environments

The application follows a clean architecture with clear separation between frontend and backend concerns, shared validation schemas, and a robust development environment setup for rapid iteration.