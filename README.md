# ChatGPT Scrapes Dashboard (React)

A modern React-based dashboard for tracking ChatGPT mentions and rankings of companies/brands. This application provides comprehensive analytics and visualizations for competitive intelligence and brand monitoring.

## Features

- **Customer Authentication**: Simple customer-based login system
- **Key Metrics**: Real-time tracking of mention rates and top rankings
- **Trend Analysis**: Time-series charts showing performance over time
- **Source Analytics**: Top cited sources with date filtering
- **Candidate Tracking**: Monitor competitor mentions and rankings
- **Raw Data Access**: Complete dataset viewing with filtering capabilities
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: Tailwind CSS
- **Date Handling**: date-fns
- **Build Tool**: Create React App

## Project Structure

```
src/
├── components/           # React components
│   ├── AuthForm.tsx     # Login form
│   ├── Dashboard.tsx    # Main dashboard layout
│   ├── MetricsCards.tsx # Key metrics display
│   ├── TrendChart.tsx   # Time-series charts
│   ├── SourcesChart.tsx # Cited sources visualization
│   ├── CandidatesChart.tsx # Candidates tracking
│   └── RawDataTable.tsx # Data table component
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state management
├── hooks/              # Custom React hooks
│   └── useData.ts      # Data fetching hooks
├── lib/                # Utility libraries
│   └── supabase.ts     # Supabase client configuration
├── App.tsx             # Main app component
├── index.tsx           # React entry point
└── index.css           # Global styles
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Schema

Your Supabase database should have a `chatgpt_scrapes` table with the following structure:

```sql
CREATE TABLE chatgpt_scrapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer TEXT NOT NULL,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_mentioned BOOLEAN DEFAULT FALSE,
  customer_top_ranked BOOLEAN DEFAULT FALSE,
  cited_sources JSONB DEFAULT '[]'::jsonb,
  candidates JSONB DEFAULT '[]'::jsonb
);
```

### 4. Run the Application

```bash
# Development server
npm start

# Production build
npm run build

# Run tests
npm test
```

## Key Components

### Authentication (`AuthContext.tsx`)
- Customer-based authentication system
- Session persistence with localStorage
- Supabase integration for customer validation

### Data Management (`useData.ts`)
- Custom hooks for data fetching
- Customer and query management
- Metrics calculation with caching

### Visualizations
- **TrendChart**: Line charts showing performance over time
- **SourcesChart**: Horizontal bar chart of most cited sources
- **CandidatesChart**: Competitor mention frequency
- **MetricsCards**: Key performance indicators

## Database Integration

The application connects to Supabase with the following data operations:

1. **Customer Validation**: Verify customer exists in database
2. **Query Fetching**: Get available queries per customer
3. **Data Retrieval**: Fetch filtered scrape results
4. **Metrics Calculation**: Real-time analytics computation

## Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Netlify Deployment
```bash
# Build the project
npm run build

# Deploy build folder to Netlify
```

## Security Considerations

- Environment variables for sensitive data
- Customer-scoped data access
- Input sanitization via TypeScript
- Supabase RLS (Row Level Security) recommended

## Comparison to Original Streamlit App

**Improvements:**
- Modern React architecture with TypeScript
- Better performance with optimized rendering
- Enhanced mobile responsiveness
- Improved state management
- Better error handling
- More maintainable code structure

**Migration Notes:**
- All original functionality preserved
- Enhanced with better UX patterns
- Improved chart interactions
- Better date filtering interfaces

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
