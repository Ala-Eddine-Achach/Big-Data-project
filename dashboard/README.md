# GitHub PR Analytics Dashboard

A modern, comprehensive dashboard for analyzing GitHub pull request data with real-time visualizations and live PR feed functionality.

## Features

### 📊 Analytics Dashboard
- **PR Merge Heatmap**: Visualize PRs merged by time slot and weekday
- **Merge Time Analysis**: Track average PR merge times across different periods
- **State Distribution**: Pie chart showing breakdown of PR states (open/closed/merged)
- **Volume Trends**: Time series chart showing PR activity over the last 30 days
- **Top Contributors**: Bar chart highlighting most active contributors

### 🔴 Live PR Feed
- Real-time (or near real-time) table of latest PRs
- Auto-refresh every 10 seconds (configurable)
- Detailed PR information including state, timestamps, and links
- Responsive design with mobile-first approach

### 🛠 Technical Features
- **TypeScript**: Full type safety throughout the application
- **Modular Architecture**: Clean separation of concerns with reusable components
- **Error Handling**: Comprehensive error states with retry functionality
- **Loading States**: Smooth loading indicators for all API calls
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Mock Data**: Built-in fallback data when API is unavailable

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd github-pr-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
VITE_API_URL=http://localhost:3001/api
VITE_WEBSOCKET_URL=ws://localhost:3001
VITE_REFRESH_INTERVAL=10000
VITE_GITHUB_TOKEN=your_github_token_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

The dashboard expects the following API endpoints:

### Analytics Endpoint
`GET /api/analytics`
```json
[
  {
    "weekday": "Mon",
    "slot": 0,
    "merged_count": 5,
    "avg_merge_time_hours": 3.4
  }
]
```

### PRs Endpoint
`GET /api/prs`
```json
[
  {
    "id": 1,
    "number": 1001,
    "title": "Fix authentication bug",
    "user_login": "developer",
    "state": "merged",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T14:20:00Z",
    "merged_at": "2024-01-15T14:20:00Z",
    "html_url": "https://github.com/org/repo/pull/1001",
    "repository": "frontend",
    "additions": 50,
    "deletions": 10,
    "changed_files": 3
  }
]
```

### Additional Endpoints
- `GET /api/pr-states` - PR state breakdown
- `GET /api/contributors` - Top contributors statistics
- `GET /api/volume` - PR volume data over time

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── charts/         # Chart components
│   ├── Dashboard.tsx   # Main dashboard component
│   ├── PRFeed.tsx     # Live PR feed component
│   └── ...
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Configuration Options

### Environment Variables
- `VITE_API_URL`: Base URL for API endpoints
- `VITE_WEBSOCKET_URL`: WebSocket URL for real-time updates
- `VITE_REFRESH_INTERVAL`: Auto-refresh interval in milliseconds
- `VITE_GITHUB_TOKEN`: Optional GitHub token for enhanced API limits

### Chart Customization
Charts can be customized by modifying the configuration in `src/components/charts/ChartConfig.ts`

## Mock Data

When API endpoints are unavailable, the application automatically falls back to realistic mock data for demonstration purposes. This ensures the dashboard remains functional during development and testing.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support, please open an issue in the GitHub repository.