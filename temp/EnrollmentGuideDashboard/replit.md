# Enrollment Guide Intake App (Manager Edition)

## Overview

This is a production-ready internal web application designed for Enrollment Guides teams to collect intake requests and track work at scale. The application provides a streamlined intake form with 17 specific benefit categories using simplified single text area sections for describing changes, and a comprehensive tracking dashboard for managers to load-balance and monitor work progress. The system is built with a focus on speed, reliability, and data hygiene without requiring external integrations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Node.js/Express Framework**: Server-side application built with Express.js providing RESTful API endpoints and server-rendered views
- **SQLite Database**: Uses `better-sqlite3` for synchronous database operations with WAL mode for performance
- **Migration System**: Custom migration runner that tracks executed migrations to handle schema evolution
- **Session Management**: Express sessions with configurable admin password authentication

### Frontend Architecture
- **Server-Side Rendering**: EJS templating engine for dynamic HTML generation
- **CSS Framework**: TailwindCSS for consistent styling and responsive design
- **Progressive Enhancement**: Client-side JavaScript enhances user experience with real-time status updates and form validation
- **Single-Page Forms**: Comprehensive intake form with expandable sections using radio button toggles and simplified text area inputs

### Data Layer
- **Models Pattern**: Separate model classes (IntakeModel, SectionModel, UploadModel) encapsulate database operations
- **Prepared Statements**: All database queries use prepared statements for security and performance
- **JSON Storage**: Section details stored as JSON payloads for flexible schema evolution

### File Management
- **Multer Integration**: Handles file uploads with configurable storage, size limits (25MB), and MIME type validation
- **Local Storage**: Files stored in `/data/uploads` directory with timestamp-based naming
- **Upload Tracking**: Database records track file metadata and associations with intake requests

### Validation Layer
- **Zod Schemas**: Comprehensive input validation for all request bodies and query parameters
- **Multi-Level Validation**: Client-side validation for UX, server-side validation for security
- **Complexity Scoring**: Algorithmic calculation of intake complexity based on sections changed and data density

### Authentication & Authorization
- **Simple Admin Auth**: Single shared password for dashboard access stored in environment variables
- **Session-Based**: Express sessions track authentication state
- **Flexible Middleware**: Authentication can be enabled/disabled via middleware configuration

### Logging & Monitoring
- **Pino Logger**: Structured JSON logging for HTTP requests and database operations
- **Error Handling**: Comprehensive error handling with user-friendly error pages
- **Request Tracking**: All HTTP requests logged with method, URL, and IP address

## External Dependencies

### Core Framework Dependencies
- **express**: Web application framework (v5.1.0)
- **better-sqlite3**: Synchronous SQLite database driver (v12.2.0)
- **ejs**: Embedded JavaScript templating engine (v3.1.10)
- **express-session**: Session middleware for Express (v1.18.2)

### File & Data Processing
- **multer**: Multipart form data handling for file uploads (v2.0.2)
- **zod**: TypeScript-first schema validation library (v4.0.17)

### Utilities & Logging
- **pino**: Fast JSON logger (v9.8.0)

### Development & Runtime
- **Node.js 18+**: Runtime environment
- **TailwindCSS**: CSS framework (delivered via CDN)

### File System Dependencies
- Local file system for SQLite database storage (`/data/enrollment.db`)
- Local file system for uploaded files (`/data/uploads/`)
- Migration files stored in `/migrations/` directory

### Environment Variables
- `PORT`: Application port (default: 5000)
- `SESSION_SECRET`: Session encryption key (default: hardcoded fallback)
- `ADMIN_PASSWORD`: Dashboard authentication password (default: 'admin123')

The application is designed to be completely self-contained without external API dependencies, database servers, or cloud services, making it ideal for internal deployment environments.