# replit.md

## Overview

Supermarket Analytics Dashboard is a comprehensive data insights platform built with a modern full-stack architecture. The application enables supermarket businesses to analyze sales data, customer traffic patterns, inventory management, and demographic insights through interactive charts and visualizations. It features a clean, professional interface with real-time data analytics capabilities.

The system is designed around core supermarket analytics entities: sales transactions, customer traffic, inventory management, and demographic analysis, providing a complete solution for data-driven business decision making with customizable chart generation and filtering capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing with a single-page application approach
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom design system featuring neutral base colors and primary blue accent colors
- **State Management**: TanStack Query (React Query) for server state management with optimistic updates
- **Form Handling**: React Hook Form with Zod validation schemas for type-safe form validation

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with standard CRUD operations and resource-specific endpoints
- **Development Server**: Custom Vite integration for hot module replacement in development
- **Request Logging**: Built-in middleware for API request/response logging with performance metrics

### Data Layer
- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM with Drizzle Kit for schema management and migrations
- **Database Provider**: Neon Database (@neondatabase/serverless) for serverless PostgreSQL
- **Schema**: Strongly typed database schemas with Zod validation
- **Storage Pattern**: Repository pattern with in-memory fallback for development/testing

### Component Architecture
- **Layout**: Sidebar navigation with analytics-focused menu
- **Pages**: Analytics Dashboard (main), CRM Dashboard, Clients, Follow-ups, Tasks, Reports, and Export views
- **Chart Components**: Interactive charts with hover functionality and filtering (Bar, Pie, Line, Area charts)
- **Custom Chart Generator**: User-configurable chart creation based on selected data and chart types
- **Data Analytics**: Real-time supermarket data visualization with sales, traffic, inventory, and demographic insights
- **Toast Notifications**: User feedback system for actions and errors

### Development Features
- **Hot Reload**: Vite development server with React Fast Refresh
- **Error Handling**: Runtime error overlay for development debugging
- **Type Safety**: End-to-end TypeScript with shared schemas between client and server
- **Path Aliases**: Configured module resolution for clean imports

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **express**: Web application framework for Node.js
- **drizzle-orm**: TypeScript ORM for database operations
- **@neondatabase/serverless**: Serverless PostgreSQL database driver

### UI and Styling
- **@radix-ui/***: Headless UI component primitives (accordion, dialog, dropdown, tabs, etc.)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library for consistent iconography
- **recharts**: Powerful charting library for creating interactive data visualizations

### Form and Validation
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Integration layer for validation libraries
- **zod**: Schema validation with TypeScript inference
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

### Development and Build Tools
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: React plugin for Vite
- **tsx**: TypeScript execution engine for development
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development enhancements