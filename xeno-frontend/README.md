# Xeno Frontend Dashboard

A React-based frontend dashboard for a Shopify-integrated multi-tenant backend system. This dashboard allows tenants to view their own customers, products, orders, and insights with JWT-based authentication.

## Features

- **Authentication**: JWT-based login with secure token storage
- **Multi-tenant**: Automatically shows data for the logged-in tenant
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Dashboard Pages**:
  - **Dashboard**: Overview with key metrics and quick actions
  - **Customers**: Paginated table with search and sorting
  - **Products**: Grid view with search and filtering
  - **Orders**: Table with date filtering and status tracking
  - **Insights**: Analytics with charts and detailed metrics

## Tech Stack

- **React 19** - Frontend framework
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Recharts** - Chart library for data visualization
- **Lucide React** - Icon library
- **Vite** - Build tool and development server

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd xeno-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Backend API Requirements

The frontend expects the following API endpoints:

- `POST /tenants/login` - User authentication
- `GET /api/customers` - Fetch customers for the tenant
- `GET /api/products` - Fetch products for the tenant
- `GET /api/orders?from=&to=` - Fetch orders with optional date filtering
- `GET /api/insights` - Fetch analytics data

All API requests (except login) require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Main layout with sidebar navigation
│   └── ProtectedRoute.jsx  # Route protection wrapper
├── contexts/
│   └── AuthContext.jsx     # Authentication context provider
├── pages/
│   ├── Login.jsx           # Login page
│   ├── Dashboard.jsx       # Main dashboard
│   ├── Customers.jsx       # Customers management
│   ├── Products.jsx        # Products catalog
│   ├── Orders.jsx          # Orders management
│   └── Insights.jsx        # Analytics and insights
├── services/
│   └── api.js              # API service utilities
├── App.jsx                 # Main app component with routing
├── main.jsx               # App entry point
└── index.css              # Global styles
```

## Features Details

### Authentication
- Secure JWT token storage in localStorage
- Automatic token refresh handling
- Protected routes with redirect to login
- Logout functionality with token cleanup

### Dashboard
- Key metrics overview (customers, orders, revenue, products)
- Top customers list
- Quick action cards for navigation

### Customers Page
- Paginated table with 10 items per page
- Search functionality (name, email)
- Sortable columns (name, email, total spent, orders)
- Customer contact information display

### Products Page
- Grid layout with product cards
- Search functionality (title, description, vendor)
- Product variants display
- Sortable by title, price, vendor

### Orders Page
- Table view with order details
- Date range filtering
- Search by order number, customer name/email
- Order status indicators
- Sortable columns

### Insights Page
- Revenue and orders trend charts
- Top customers pie chart
- Order status distribution
- Recent activity feed
- Quick stats metrics

## Styling

The application uses Tailwind CSS for styling with:
- Responsive design (mobile-first)
- Custom color scheme
- Smooth transitions and animations
- Custom scrollbars
- Loading states and error handling

## Error Handling

- API error handling with user-friendly messages
- 401 errors automatically redirect to login
- Loading states for all async operations
- Network error detection and user feedback

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env` file in the root directory to customize:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. The `dist` folder contains the production build
3. Deploy the contents to your web server
4. Update the API base URL in `src/services/api.js` for production

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Xeno assignment.