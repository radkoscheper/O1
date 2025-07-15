# Ontdek Polen - Polish Travel Website

## Overview

This is a full-stack web application for discovering beautiful places in Poland. It's a travel website that showcases Polish destinations, travel guides, and provides information about various locations throughout the country. The application is built with a modern tech stack using React for the frontend and Express for the backend.

**Stadium 1 Complete (2025-01-15)**:
✅ **CORE FEATURES IMPLEMENTED**:
- Complete Polish travel website "Ontdek Polen" with Dutch interface
- Multi-user authentication system with role-based permissions (admin/editor/viewer)
- PostgreSQL database integration with Neon serverless
- Comprehensive CMS with content management for destinations and guides
- Full backup/restore system with recycle bin functionality
- Soft delete capabilities with is_deleted and deleted_at columns
- Image management with proactive archiving system
- Complete site settings CMS system with dynamic head element management
- Admin-only interface for site name, description, meta keywords, background images, logos, favicon, Google Analytics, and custom CSS/JS
- **FULLY WORKING**: Frontend integration of site settings - title, description, background images, and SEO metadata dynamically loaded from CMS
- Header background images successfully swapped (header.jpg ↔ header-background.jpg)
- Dynamic document title, meta tags, favicon, custom CSS/JS injection
- Google Analytics integration through CMS
- Responsive design with mobile-first approach

**Stadium 1 Status**: ✅ COMPLETE AND STABLE
- All core functionality tested and working
- Database schema finalized
- Admin interface fully functional
- Site settings actively integrated with frontend
- Ready for production deployment or further development

**Stadium 2 Progress (2025-01-15)**: ✅ TEMPLATE SYSTEM FULLY IMPLEMENTED
✅ **TEMPLATE SYSTEM COMPLETED**:
- Complete template and pages database schema with PostgreSQL tables
- Template CRUD operations with variable support ({{title}}, {{description}}, etc.)
- Pages system with template selection and SEO metadata
- Soft delete support for pages with recycle bin functionality
- API endpoints for templates and pages management (admin-only for templates)
- Sample templates created: "Travel Destination Template" and "Travel Guide Template"
- Test pages generated using templates for Krakow and Warsaw destinations
- Admin interface extended with Pages and Templates tabs
- Full backend implementation tested and working
- **FRONTEND INTEGRATION COMPLETED**:
  - Dynamic page routing system implemented with wouter
  - Individual page component with SEO metadata integration
  - Pages displayed on home page with template information
  - Direct navigation to pages via slug URLs (e.g., /krakow-ontdekken)
  - Template variable rendering with markdown-style formatting
  - Responsive design with proper navigation and meta tags

**Stadium 2 Status**: ✅ COMPLETE AND FUNCTIONAL
- All template and page functionality working end-to-end
- Pages accessible via direct URLs and home page links
- CMS management fully operational for templates and pages
- SEO metadata properly implemented for all pages

**Stadium 3 Progress (2025-01-15)**: ✅ HEADER CONSISTENCY IMPLEMENTED
✅ **HOMEPAGE-STYLE HEADERS COMPLETED**:
- All template pages now have identical header structure as homepage
- Consistent py-24 padding and spacing across all pages
- Unique background images per destination (krakow.jpg, tatra.jpg, etc.)
- Exact same button styling and layout positioning
- Uniform search functionality and footer on every page
- Enhanced content quality for all existing pages

**Stadium 3 Status**: ✅ COMPLETE AND CONSISTENT
- Perfect visual consistency between homepage and all template pages
- Enhanced user experience with uniform navigation and styling
- All five destination pages (Krakow, Warschau, Tatra, Gdansk, Bialowieza) fully updated

## User Preferences

Preferred communication style: Simple, everyday language.
Language: Dutch (Nederlands) - User prefers communication in Dutch.
Development approach: Milestone-based development with backup points (Stadium 1, Stadium 2, etc.)
Backup strategy: Create stable checkpoints before major changes for easy rollback capability.

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
- **Users**: Multi-role user management with permission controls (admin/editor/viewer)
- **Destinations**: Travel destinations with soft delete support and ranking system
- **Guides**: Travel guides with soft delete support and ranking system
- **Pages**: Dynamic pages with template support, SEO metadata, and soft delete functionality
- **Templates**: Reusable content templates with variable substitution and SEO defaults
- **Site Settings**: Global site configuration with dynamic frontend integration
- **Schema**: Defined using Drizzle ORM with Zod validation schemas
- **Backup System**: Soft delete with is_deleted and deleted_at columns for content recovery

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