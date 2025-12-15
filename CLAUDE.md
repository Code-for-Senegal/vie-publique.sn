# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vie Publique Sénégal - A Nuxt 3 web application providing transparent access to public information in Senegal, including national assembly data, budget visualizations, and election information.

## Essential Commands

```bash
# Development
npm run dev                    # Start development server at http://localhost:3000

# Building
npm run build                  # Build for production
npm run generate               # Generate static site
npm run preview                # Preview production build locally

# Code Quality
npm run lint                   # Check code with ESLint
npm run lint:fix               # Auto-fix linting issues
npm run format                 # Format code with Prettier

# Testing
cd test/locust && locust       # Run load tests (Python required)
```

## Architecture Overview

### Core Stack

- **Framework**: Nuxt 3 with Vue 3, server-side rendering
- **UI**: Nuxt UI + Tailwind CSS
- **State**: Pinia stores in `/stores/`
- **Type Safety**: TypeScript with types in `/types/`

### Key Architectural Decisions

1. **Feature-Based Component Organization**: Components are grouped by domain (Assembly, Budget, Election) rather than by type, making feature development more cohesive.

2. **Composables for Data Logic**: All data fetching and business logic is abstracted into composables (`/composables/`), keeping components focused on presentation.

3. **Server API Routes**: Backend functionality lives in `/server/api/` with endpoints for:
   - Assembly data (`/api/assembly/*`)
   - Budget information (`/api/budget/*`)
   - Election data (`/api/elections/*`)
   - **CMS Asset Proxy** (`/medias/*`, `/documents/*`) - SEO-friendly proxy to CMS
   - External service proxies (Twitter, data.gouv.sn)

4. **Type Definitions**: Centralized in `/types/` with separate files for each domain (assembly.ts, budget.ts, election.ts).

### Environment Configuration

Required environment variables (see .env.example):

- `NUXT_PUBLIC_SITE_URL`: Production URL for SEO
- `CMS_API_URL`: CMS backend URL (without trailing slash)
- `CMS_API_URL_ASSETS`: Direct CMS assets URL (without trailing slash)
- `NUXT_TURNSTILE_SECRET_KEY`: Cloudflare Turnstile for security

**⚠️ IMPORTANT**: All URLs must be WITHOUT trailing slash to avoid double-slash issues in the CMS proxy system.

### Development Workflow

1. **Branch Strategy**: Work on `develop` branch, create PRs to `develop`
2. **Commit Convention**: Use Conventional Commits (feat:, fix:, docs:, etc.)
3. **Before Committing**: Always run `npm run lint:fix` and `npm run format`
4. **Type Safety**: Ensure all new code has proper TypeScript types

### Critical Patterns

1. **API Data Fetching**:

   ```typescript
   // Use composables for data fetching
   const { data, pending, error } = await useAsyncData('key', () => $fetch('/api/endpoint'));
   ```

2. **Component Props**: Always define with TypeScript:

   ```typescript
   interface Props {
     data: AssemblyMember[];
     loading?: boolean;
   }
   const props = defineProps<Props>();
   ```

3. **SEO Optimization**: Use `useSeoMeta()` and `useHead()` in pages
4. **Error Handling**: Wrap API calls in try-catch, use `showError()` for user feedback

### Performance Considerations

- PWA enabled with service worker
- Image optimization through Nuxt Image
- Lazy loading for heavy components (charts, maps)
- Static generation where possible (`npm run generate`)

### Security Features

- CSP headers configured via nuxt-security
- Rate limiting in production
- Input validation on all API endpoints
- Turnstile integration for form protection

### port de démarrage

démarre toujours le projet sur le port 3000

pour killer les autres projet sur windows

identifie le process avec netstats

et ensuite :
powershell -Command "Stop-Process -Id 28032 ││ -Force"
