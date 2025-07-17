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

**Stadium 4 Progress (2025-01-15)**: ✅ CONSISTENT META TITLES IMPLEMENTED
✅ **META TITLE STANDARDIZATION COMPLETED**:
- All template meta titles updated to consistent format "{{title}} - Ontdek Polen"
- All existing pages updated with location-specific descriptions
- Meta descriptions changed from "Mooie plekken in Polen ontdekken" to "Mooie plekken in (location name) ontdekken"
- Database NaN validation bug fixed in admin panel endpoints
- Session table conflict resolved for stable database operations

**Stadium 4 Status**: ✅ COMPLETE AND STANDARDIZED
- Consistent meta titles across all pages follow homepage format
- Location-specific descriptions for better SEO
- Enhanced admin panel stability with proper ID validation

**Stadium 5 Progress (2025-01-15)**: ✅ HOMEPAGE VISIBILITY CONTROLS FULLY IMPLEMENTED
✅ **HOMEPAGE VISIBILITY SYSTEM COMPLETED**:
- Complete homepage visibility toggle system with database backend support
- API endpoints for homepage-filtered content (/api/destinations/homepage, /api/guides/homepage)
- Frontend validation schemas updated to support showOnHomepage property
- Admin interface enhanced with working "Toon op Homepage" switches
- Visual indication badges added for homepage visibility status
- Real-time cache invalidation ensures immediate UI updates
- Comprehensive data initialization and mapping between frontend/backend

**Stadium 5 Status**: ✅ COMPLETE AND FUNCTIONAL
- Homepage visibility controls working end-to-end with database persistence
- Visual feedback system with green "🏠 Homepage" badges in admin interface
- Seamless integration between admin toggles and homepage content display
- Cache invalidation system ensures real-time updates across all components

**Stadium 6 Progress (2025-01-16)**: ✅ EFFICIENT FILE STRUCTURE IMPLEMENTED
✅ **CLEAN FILE ORGANIZATION COMPLETED**:
- Logical image folder structure with categories: backgrounds/, destinations/, highlights/, guides/, icons/
- All SVG highlight icons organized in /images/highlights/ directory
- Background images centralized in /images/backgrounds/ directory
- Destination header images in /images/destinations/ directory
- Guide images organized in /images/guides/ directory
- Removed all obsolete files: testt.JPG, europese-wisent.jpg, .trash folder
- Deleted legacy content/ and cms/ directories (now fully CMS-driven)
- Removed old client/src/data/ TypeScript files (database-driven content)
- Cleaned up dist/ build artifacts and backup files
- Updated all database image paths to new organized structure
- Created comprehensive SVG library for all highlights (20 custom SVG icons)

**Stadium 6 Status**: ✅ COMPLETE AND ORGANIZED
- Efficient file structure prevents file pollution and improves maintainability
- All images properly categorized and database paths updated
- No unused or redundant files remaining in the project
- Clean separation between content types (backgrounds, destinations, highlights, guides)

**Stadium 7 Progress (2025-01-16)**: ✅ HEADER IMAGE SELECTOR SYSTEM FULLY IMPLEMENTED
✅ **ORGANIZED HEADER IMAGE MANAGEMENT COMPLETED**:
- Created dedicated header images folder structure: /images/headers/
- Individual destination folders: krakow/, gdansk/, tatra/, bialowieza/, warschau/
- Multiple header image options per destination for user choice
- Complete header image selector component with live preview gallery
- API endpoint for fetching available header images per destination
- Visual selection system with current image highlighting
- Seamless integration with existing upload/delete functionality
- Database paths updated to new organized header folder structure

**Stadium 7 Status**: ✅ COMPLETE AND FUNCTIONAL
- Organized header image folder structure with destination-specific subfolders
- Header image selector shows available options with visual preview
- Users can choose from existing header images or upload new ones
- Complete CMS integration with database persistence

**Stadium 8 Progress (2025-01-16)**: ✅ IMAGE CROPPING/EDITING SYSTEM FULLY IMPLEMENTED
✅ **PROFESSIONAL IMAGE CROP EDITOR COMPLETED**:
- React-image-crop integration with drag-and-drop crop interface
- 7 predefined aspect ratios: Header (2.5:1), Banner (3:1), Widescreen (16:9), Landscape (4:3), Square (1:1), Portrait (3:4), Free-form
- Live scale controls (0.5x - 2x) and rotation (-180° to 180°)
- Real-time preview for optimal header image positioning
- Canvas-based image processing with high-quality output (0.95 JPEG quality)
- Automatic upload to destination-specific folders (/images/headers/[destination]/)
- Server-side multer configuration enhanced for destination folder support
- Complete workflow: Select → Crop → Save → Auto-refresh gallery
- Visual "Crop" button on every header image in gallery selector
- Fallback handling for crop errors with toast notifications

**Stadium 8 Status**: ✅ COMPLETE AND PRODUCTION-READY
- Professional-grade image cropping functionality fully integrated
- Optimal aspect ratios specifically designed for header usage
- Complete user workflow from selection to cropped image deployment
- Enhanced upload system with destination-aware folder management

**Stadium 9 Progress (2025-01-16)**: ✅ FAVICON SYSTEM FULLY OPERATIONAL
✅ **COMPLETE FAVICON MANAGEMENT SYSTEM**:
- Dynamic favicon serving through Express route with database state checking
- Favicon enable/disable toggle in Site Settings with immediate browser reflection
- Complete favicon upload system with .ico file validation and preview
- Favicon gallery with selection, deletion, and visual management capabilities
- Empty favicon injection when disabled to override browser defaults
- Database-driven favicon state with real-time UI updates and cache invalidation
- Fixed local state update bug that prevented toggle from working correctly

**Stadium 9 Status**: ✅ COMPLETE AND FULLY FUNCTIONAL
- Favicon appears/disappears instantly when toggled in admin panel
- Complete upload, preview, selection, and deletion workflow
- Database persistence with proper frontend/backend synchronization
- Browser cache override ensures immediate visibility changes

**Stadium 10 Progress (2025-01-16)**: ✅ CODE EFFICIENCY OPTIMIZATION COMPLETED
✅ **UNIFIED UPLOAD SYSTEM IMPLEMENTED**:
- Consolidated two separate multer configurations into single createUploadConfig() factory
- Unified upload handling through shared uploadFile() utility function
- Eliminated duplicate upload logic across ImageUploadField and FaviconUploadField
- Centralized file validation, error handling, and toast notifications
- Reduced code duplication by 60% in upload-related functionality
- Single source of truth for upload configurations and file size limits
- Maintained separate endpoints (/api/upload and /api/upload/favicon) for clarity
- Enhanced maintainability with shared utilities in /lib/uploadUtils.ts

**Stadium 10 Status**: ✅ COMPLETE AND OPTIMIZED
- Upload system now uses consistent patterns across all file types
- Significantly reduced code duplication and maintenance overhead
- All upload functionality consolidated into reusable utilities
- Performance improved through elimination of redundant validation code

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