# Ontdek Polen - Polish Travel Website

## Overview

"Ontdek Polen" is a full-stack web application designed to showcase Polish destinations, provide travel guides, and share information about various locations across Poland. The project aims to be a comprehensive travel website with a modern user experience and robust content management capabilities. Key capabilities include multi-user authentication with role-based permissions, integration with a PostgreSQL database, a comprehensive CMS for destinations and guides, a full backup/restore system with soft delete, dynamic image management, and extensive site settings. The platform supports a fully dynamic templating and pages system for scalable content creation and is designed for production deployment, including Vercel hosting. The site now features a luxury loading screen with Polish branding and smooth transitions. The long-term vision is to establish a leading online resource for Polish tourism, with potential for template sales and rapid project replication.

## User Preferences

Preferred communication style: Simple, everyday language.
Language: Dutch (Nederlands) - User prefers communication in Dutch.
Development approach: Milestone-based development with backup points.
Backup strategy: Create stable checkpoints before major changes for easy rollback capability.
Fallback documentation: Maintain REPLIT_FALLBACK_DOCUMENTATION.md for critical system understanding and error prevention.
Chat organization: Use structured phase documentation system with clear milestones, session summaries, and progress tracking for easy navigation through development history.

## System Architecture

### UI/UX Decisions
The website features a consistent, modern, and responsive design with a mobile-first approach. All pages, including templates, maintain a uniform header structure, consistent padding, button styling, and layout positioning. Visual consistency is a high priority, with standardized meta titles (`{{title}} - Ontdek Polen`) and location-specific meta descriptions for improved SEO. A luxury loading screen with dark gradient background, golden "P" logo, animated rings, and bouncing dots provides professional page transitions. 

**Hero Section Design**: The homepage features a stunning full-screen Hero Section with WebsiteBuilder luxury styling, including large Playfair Display typography (80px mobile, 112px desktop), gradient overlay (navy-dark with varying opacity), centered search bar with rounded-full design and backdrop-blur effects, and elegant CTA buttons with hover animations. Complete configuration documented in HERO_SECTION_CONFIGURATION.md for future reference.

**Typography System**: Consistent 2-font system implemented across all pages - Playfair Display (serif) for headings and titles, Inter (sans-serif) for body text and descriptions. Removed Cormorant Garamond and other inconsistent fonts. All pages now use font-playfair for headings and font-croatia-body for body text, ensuring visual consistency and professional appearance throughout the site.

A custom travel slider component is implemented using `embla-carousel-react` for enhanced content browsing on the homepage, destination pages, and discovery sections, featuring responsive layouts (1-4 items visible based on screen size) and navigation arrows. Custom SVG icons are extensively used to provide an authentic Polish travel experience. The admin panel is designed for clarity and ease of use, with personalized greetings, logical grouping of features (e.g., Administrator vs. Website Onderdelen), and clear status indicators.

### Technical Implementations
The application utilizes a React 18 frontend with TypeScript, built using Vite and styled with Tailwind CSS and shadcn/ui. State management is handled by TanStack Query, and routing by Wouter. Form handling is managed with React Hook Form and Zod for validation. The backend is built with Node.js and Express.js, using TypeScript (ESM modules). PostgreSQL is the chosen database, with Drizzle ORM for database operations and connect-pg-simple for session management. The system supports dynamic content rendering, with page content and SEO metadata loaded from the CMS. It includes an automatic file renaming system for uploaded images based on location names and ensures data consistency between the database and file system. A unified upload system centralizes file handling and validation. Authentication flow is optimized for seamless login with immediate UI updates. All internal links are prioritized over external ones, ensuring a cohesive user experience within the site.

### Feature Specifications
- **Multi-user Authentication**: Role-based permissions (admin/editor/viewer) with optimized login/logout flow.
- **CMS**: Comprehensive content management for destinations, guides, pages, site settings, and search configurations. Supports soft delete, content archiving, and dynamic content injection.
- **Dynamic Templating System**: Reusable templates with variable support, allowing for rapid creation of new pages and destinations.
- **Image Management**: Integrated system for managing header images, including a professional image cropping tool with predefined aspect ratios, live preview, and automatic upload to destination-specific folders. Dynamic favicon management is also supported.
- **Homepage Controls**: Granular control over which destinations and guides appear on the homepage with real-time updates.
- **Search Functionality**: Configurable search bar with multiple scopes (homepage, destination, global, highlights, guides) and category indicators in search results.
- **Content Expansion**: Extensive content library with 40 destinations and 93 activities, linked and optimized for location-specific filtering.
- **Database Monitoring Dashboard**: Admin-only panel for live database connection monitoring, comprehensive statistics, and table overviews with auto-refresh.
- **Deployment-Ready**: Configured for Vercel deployment with optimized build processes, proper environment variable handling, and robust documentation for multi-platform hosting.

### System Design Choices
The project follows a monorepo structure with shared code between the client and server. Content is managed through a JSON-based CMS, with a CLI interface for generation and management. A clean architecture separates frontend and backend concerns, and Drizzle ORM ensures type-safe database operations. A soft delete mechanism is implemented across all major data models for content recovery. All 40 destinations have dedicated, rich content pages, and a smart fallback system prioritizes destination-specific routes, reducing redundant page lookups. The system is designed for scalability, allowing new destinations to automatically integrate without manual page creation.

## External Dependencies

- **Neon Database**: Serverless PostgreSQL database for persistent data storage.
- **React**: Frontend JavaScript library.
- **Vite**: Frontend build tool.
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Component library built on Radix UI.
- **TanStack Query (React Query)**: Data fetching and state management for React.
- **Wouter**: Lightweight client-side router for React.
- **React Hook Form**: Form management library.
- **Zod**: Schema validation library.
- **Node.js**: Backend JavaScript runtime.
- **Express.js**: Backend web framework.
- **Drizzle ORM**: TypeScript ORM for database interactions.
- **connect-pg-simple**: PostgreSQL session store for Express.
- **multer**: Node.js middleware for handling multipart/form-data.
- **react-image-crop**: Image cropping library for React.
- **embla-carousel-react**: Carousel library for React.
- **Lucide React**: Icon library.
- **ESBuild**: Fast JavaScript bundler.
- **TypeScript**: Programming language for type safety.