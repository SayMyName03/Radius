# Analytics Dashboard

## Overview
The Analytics Dashboard provides comprehensive visualization of your lead generation metrics using shadcn area charts and bar charts powered by Recharts.

## Features

### 📊 Visual Components

1. **Stat Cards (4 Metrics)**
   - Total Leads: Cumulative count of all leads
   - New Leads (7 days): Recent lead acquisitions
   - Converted: Successfully converted leads
   - Conversion Rate: Percentage of converted vs total leads

2. **Lead Activity Area Chart**
   - 30-day time series showing lead funnel progression
   - Stacked areas for: New Leads → Contacted → Responded → Converted
   - Interactive tooltips with daily breakdowns
   - Gradient fills for visual clarity
   - Legend showing all funnel stages

3. **Leads by Source (Bar Chart)**
   - Distribution of leads across different sources (Indeed, Naukri, etc.)
   - Horizontal axis: Source names
   - Vertical axis: Lead count
   - Interactive hover tooltips

4. **Leads by Status (Progress Bars)**
   - Visual breakdown of current lead pipeline
   - Percentage and absolute count for each status
   - Color-coded progress bars
   - Status categories: New, Contacted, Responded, Converted, etc.

## Tech Stack

- **React**: Component framework
- **Recharts**: Chart rendering library (installed)
- **shadcn/ui Chart Components**: Pre-built chart wrappers
- **TailwindCSS**: Styling

## File Structure

```
client/src/components/
├── AnalyticsDashboard.jsx     # Main analytics page
└── ui/
    └── chart.jsx                # shadcn chart components
```

## Usage

Navigate to: `/dashboard/analytics`

Or click "View Analytics" from the main Dashboard.

## Data Flow

1. Component fetches stats via `getLeadStats()` API call
2. Backend returns: `{ total, newLeads, converted, byStatus, bySource }`
3. Component transforms data for chart consumption
4. Recharts renders visualizations

## Notes

- **Mock Time Series**: The 30-day trend currently uses generated data based on current stats. In production, the backend should provide historical daily data.
- **Real-time Updates**: Click "Refresh" to fetch latest stats
- **Empty State**: Shows helpful message when no leads exist
- **Responsive**: Layouts adapt to screen sizes (mobile-friendly)

## Future Enhancements

1. **Backend Historical Data**: Store daily snapshots of lead counts
2. **Date Range Picker**: Allow users to select custom time ranges
3. **Export Data**: CSV/PDF export functionality
4. **More Metrics**: 
   - Response rate trends
   - Average time to conversion
   - Source performance comparison
5. **Filtering**: Filter charts by date, source, or status
6. **Real-time Updates**: WebSocket integration for live data

## Color Palette

- New Leads: Green (`hsl(142, 76%, 36%)`)
- Contacted: Blue (`hsl(221, 83%, 53%)`)
- Responded: Purple (`hsl(262, 83%, 58%)`)
- Converted: Orange (`hsl(25, 95%, 53%)`)
