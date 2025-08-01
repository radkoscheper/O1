# Ontdek Polen - Polish Travel Website

## Overview
"Ontdek Polen" is a full-stack web application designed to showcase Polish destinations and travel guides. It aims to be a comprehensive resource for discovering beautiful places in Poland, offering dynamic content management for destinations, guides, and site-wide settings. The project prioritizes a modern user experience with a Dutch interface, robust content management capabilities, and a scalable architecture. The business vision is to provide a go-to platform for Polish travel, with potential for template sales and rapid deployment for similar content-driven websites.

## User Preferences
Preferred communication style: Simple, everyday language.
Language: Dutch (Nederlands) - User prefers communication in Dutch.
Development approach: Milestone-based development with backup points (Stadium 1, Stadium 2, etc.)
Backup strategy: Create stable checkpoints before major changes for easy rollback capability.

## System Architecture

### UI/UX Decisions
The website features a modern, responsive design with a mobile-first approach. It utilizes a luxury design aesthetic inspired by "Visit Croatia," incorporating a navy (#1a365d) and gold (#d4af37) color scheme, and elegant typography (Playfair Display/Cormorant Garamond fonts). Key UI/UX decisions include:
- Consistent header structure and styling across all pages.
- Dynamic background images and SEO metadata loaded from the CMS.
- Homepage-style headers and consistent padding across all template pages.
- Modernized search functionality with larger input fields and glassmorphism effects.
- Enhanced card layouts with image previews and consistent button styling.
- Integration of travel sliders for efficient content display on various pages.
- AI-optimized header image transformations via Cloudinary for enhanced visual quality.
- Visit Norway-inspired loading screens that dynamically display content from the CMS.
- Multi-tab CMS interface (Details, Cloudinary, Rich Text, SEO & Meta) for comprehensive content management.
- Custom SVG icons for an authentic Polish travel experience.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite for bundling, Tailwind CSS for styling (with shadcn/ui), TanStack Query for state management, Wouter for routing, and React Hook Form with Zod for forms.
- **Backend**: Node.js with Express.js (TypeScript ESM modules), Drizzle ORM for PostgreSQL operations, and connect-pg-simple for session management.
- **Data Models**: Comprehensive CMS with models for Users (multi-role), Destinations, Guides, Pages, Templates, Site Settings, all supporting soft delete and versioning.
- **Image Management**: Integrated with Cloudinary for professional image handling, including automatic compression, WebP conversion, smart naming, and CDN delivery. Local images have been fully migrated to Cloudinary.
- **Search System**: Extensible search bar CMS with support for homepage, destination, global, highlights, and guides scopes.
- **Authentication**: Robust multi-user authentication with role-based permissions and optimized login flow.
- **File Management**: Automated file renaming, organized folder structures (e.g., `/images/headers/`, `/images/destinations/`), and a clean project structure.
- **Deployment**: Configured for Vercel deployment, with optimized build processes (Vite + ESBuild) and environment variable management.

### Feature Specifications
- **Content Management System (CMS)**: Comprehensive CMS with CRUD operations for destinations, guides, pages, and templates. Includes features like homepage visibility toggles, dynamic SEO metadata, and a full backup/restore system with a recycle bin.
- **Dynamic Content**: All site settings, content, and images are dynamically loaded from the CMS and database.
- **Internal Linking**: A robust internal link structure ensures seamless navigation between homepage, activity details, and destination pages, with automatic scrolling to relevant sections.
- **Database Monitoring**: An admin-only dashboard provides real-time database status, table statistics, and secure monitoring of the Neon PostgreSQL database.
- **Scalability**: Designed to automatically generate destination pages from database entries, eliminating the need for manual page creation for each new destination.

## External Dependencies

- **Neon Database**: Serverless PostgreSQL database for primary data storage.
- **Cloudinary**: Cloud-based media management platform for image storage, optimization, and delivery.
- **Radix UI**: Primitive components for accessible UI elements.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Lucide React**: Icon library for UI elements.
- **TanStack Query (React Query)**: For server state management and data fetching.
- **Embla Carousel React**: Library used for implementing travel sliders.
- **React Hook Form** and **Zod**: For form handling and validation.
- **React-image-crop**: For in-browser image cropping functionality.
- **Drizzle ORM**: Type-safe ORM for database interactions.
- **ESBuild**: Fast bundler used for the backend server code.