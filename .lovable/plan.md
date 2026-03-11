

# AI Consulting Brain — Implementation Plan

## Overview
A comprehensive AI consulting platform with a dark navy sidebar, multiple dashboard views, client workspaces, AI analysis tools, and deliverable generation — all built with React + Supabase.

## Design System
- **Font**: Inter from Google Fonts
- **Sidebar**: Dark navy (#1B2A4A), 240px wide
- **Content area**: Off-white (#F8FAFC)
- **Accent colors**: Blue (#2563EB), Green (#16A34A), Amber (#D97706), Red (#DC2626)
- **Cards**: White, rounded-xl, shadow-sm, border
- **Icons**: Lucide React throughout

## Pages & Features

### 1. Sidebar Navigation (persistent)
- Logo: "AI Consulting Brain" with brain icon
- Nav links: Dashboard, Clients, Knowledge Base, AI Agents, Insights, Deliverables, Settings

### 2. Dashboard (`/`)
- **Active Engagements**: Client cards with progress bars, phase badges (Analysis/Discovery/Reporting), status pills (On Track/Needs Attention/Complete)
- **AI Opportunity Radar**: Alert cards with actionable insights and "Explore Idea" buttons
- **Knowledge Maturity**: Stats (Case Studies, Frameworks, Domain Coverage)
- **Proactive Insights Feed**: Severity-coded alerts (red/amber/blue) with timestamps and "Investigate" actions

### 3. Client List (`/clients`)
- Searchable/filterable grid of client cards
- Status filters, industry filters
- Create new client form

### 4. Client Workspace (`/clients/:id`)
- **Header**: Client avatar, name, industry, revenue, location, action buttons (Edit, Run AI Analysis, Generate Deliverable)
- **Tabbed interface**:
  - **Overview**: Company context, active problems (severity-coded), strategic goals & KPIs with status tracking, recent AI insights
  - **Data**: Document management with upload, file list with extraction status
  - **Analysis**: Period/product/region filters, Revenue Trend line chart (Recharts), Market Share donut chart, AI-generated key insights with confidence levels and "View Reasoning" panels
  - **Strategy**: Problem statement banner, strategy option cards (A/B/C) with impact/risk/investment ratings, simulation results, Accept/Refine/Reject actions, accepted strategies list
  - **Reports**: Generated deliverables list with download links
  - **Activity Log**: Timeline of all actions

### 5. Analysis Dashboard (`/clients/:id/analysis`)
- Filter bar: Analysis Period, Product, Region
- Revenue Trend chart (actual vs target, 12 months)
- Regional Revenue Split donut chart
- AI-Generated Key Insights cards with confidence badges, source files, and "View Reasoning" slide-out panel showing sources, frameworks, agent steps

### 6. Strategy View (`/clients/:id/strategy`)
- Problem statement banner
- 3 strategy option cards with simulation results (Revenue %, Cost %, ROI breakeven)
- Accept/Reject/Refine workflow
- Accepted strategies section with "View Roadmap" link

### 7. Deliverable Generator (`/clients/:id/deliverables`)
- **3-step wizard**:
  1. Choose Type: Executive Summary, Full Report, Strategy Presentation, Board Report, Implementation Plan, Financial Analysis
  2. Select Audience: CEO, Board, Marketing, Operations, Finance, All Stakeholders — with live tone preview
  3. Configure & Generate: Output format selection, options checkboxes, generate button with loading state and download

### 8. AI Agent Workspace (`/agents`)
- Client context selector
- 9 agent cards showing: name, model, task, status (queued/running/complete)
- Animated status dots, progress indicators
- "View Output" and "View Trace" modals
- Live Activity Feed with timestamped entries
- Timeline/Gantt toggle view
- Consolidated Results tabs (Key Findings, Strategy Options, Simulation Results, Implementation Roadmap)

### 9. Knowledge Base (`/knowledge`)
- Stats header: Case Studies, Frameworks, Playbooks, Domain Coverage
- Tabbed content: Playbooks, Case Studies, Frameworks, Custom Knowledge
- Playbook cards with success rates and "Apply to Client" dropdowns
- File upload zone (drag & drop)

### 10. Insights (`/insights`)
- Proactive insights feed with severity filters
- Mark All Read action
- Per-insight: client tag, description, "Investigate" action, timestamp

## Supabase Backend

### Database Tables
- **profiles** — user profiles linked to auth.users
- **clients** — company info, industry, revenue, goals, health score
- **engagements** — linked to clients, with type, phase, progress, status
- **documents** — file metadata, extraction status
- **analyses** — analysis records with findings, frameworks, confidence
- **strategies** — strategy options with ratings, simulation results, status
- **insights** — proactive insights with severity, read/dismiss status
- **deliverables** — generated documents metadata
- **audit_trails** — reasoning traces for AI transparency
- **user_roles** — role-based access (admin/user)

### Authentication
- Email/password signup and login
- Protected routes requiring authentication

### Row-Level Security
- Users can only access their own data
- Role-based access via security definer function

## Data Approach
All pages will use **realistic mock/seed data** for the 3 sample clients (ABC Distribution, XYZ Manufacturing, Retail Plus Co.) so the app looks fully functional. Charts use Recharts with mock datasets. AI features will show realistic pre-generated results — ready to be connected to real AI APIs via edge functions later.

## Key Interactions
- Client cards navigate to workspace
- "Run AI Analysis" triggers a simulated analysis flow with progress
- "Generate Deliverable" opens the 3-step wizard
- Insight cards link to relevant client analysis
- Strategy accept/reject updates status in database
- Document upload stores metadata in Supabase

