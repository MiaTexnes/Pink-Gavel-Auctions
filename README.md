# Pink Gavel Auctions

A modern auction website where users can create listings and bid on items. Built with JavaScript, Vite, and Tailwind CSS as part of Noroff's Semester Project 2.

## 🎯 Project Overview

Pink Gavel Auctions is a comprehensive auction platform that allows registered users to:

- Create and manage auction listings with images, descriptions, and deadlines
- Place bids on other users' listings
- Manage their credit balance (users start with 1000 credits)
- View bidding history and auction status
- Search and filter through available listings

Non-registered users can browse and search listings but cannot participate in bidding.

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/MiaTexnes/Pink-Gavel-Auctions.git
   cd Pink-Gavel-Auctions
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build CSS (if needed)**
   ```bash
   npm run build:css
   ```

### Running the Application

#### Development Mode

```bash
npm run dev
```

This will start the Vite development server, typically at `http://localhost:3000` (or next available port).

#### Production Build

```bash
npm run build
```

Builds the application for production in the `dist` folder.

#### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

Run tests once (for CI):

```bash
npm run test:run
```

Run tests with coverage:

```bash
npm run test:coverage
```

## 📁 Project Structure

```
Pink-Gavel-Auctions/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── header.js       # Navigation and auth state
│   │   ├── footer.js       # Footer component
│   │   ├── searchAndSort.js # Search functionality
│   │   ├── carousel.js     # Image carousel
│   │   └── ...
│   ├── pages/              # Page-specific JavaScript
│   │   ├── index.js        # Homepage logic
│   │   ├── login.js        # Login page
│   │   ├── register.js     # Registration page
│   │   ├── profile.js      # User profile management
│   │   ├── item.js         # Individual auction item
│   │   └── allListings.js  # Listings page
│   ├── library/            # Core utilities and API
│   │   ├── auth.js         # Authentication functions
│   │   ├── newListing.js   # Listing creation
│   │   └── api.config.js   # API configuration
│   ├── services/           # Service layer
│   │   ├── biddingService.js # Bidding operations
│   │   └── baseApi.js      # Base API configuration
│   ├── css/
│   │   ├── input.css       # Tailwind input file
│   │   └── style.css       # Generated CSS
│   └── main.js             # Application entry point
├── public/                 # Static assets
├── *.html                  # HTML pages
├── package.json
└── README.md
```

## ✅ User Stories Implementation

### Completed Features

- [x] **User Registration**: Users with stud.noroff.no email can register
- [x] **User Login**: Registered users can login securely
- [x] **User Logout**: Registered users can logout
- [x] **Avatar Update**: Registered users can update their avatar
- [x] **Credit Display**: Registered users can view their total credits
- [x] **Create Listings**: Users can create listings with title, deadline, media gallery, and description
- [x] **Place Bids**: Users can bid on other users' listings
- [x] **View Bids**: Users can view all bids made on listings
- [x] **Search Listings**: Unregistered users can search through listings
- [x] **Responsive Design**: Fully responsive across all device sizes
- [x] **Dark Mode**: Toggle between light and dark themes

### Additional Features

- [x] **Auto-logout**: 30-minute inactivity timeout for security
- [x] **Real-time Updates**: Live countdown timers for auction endings
- [x] **Image Gallery**: Multi-image support for listings
- [x] **Bidding Validation**: Prevents invalid bids and self-bidding
- [x] **Listing Management**: Edit and delete own listings

## 🔧 Technical Requirements Compliance

- ✅ **CSS Framework**: Tailwind CSS v3.4.7
- ✅ **Static Hosting Ready**: Builds to static files for deployment
- ✅ **Modern Build Tools**: Vite for fast development and optimized builds
- ✅ **Code Quality**: Prettier formatting and Husky pre-commit hooks

## 🌐 API Integration

This application integrates with the Noroff API v2:

- **Base URL**: https://v2.api.noroff.dev
- **API Key**: Integrated for required endpoints
- **Endpoints Used**:
  - Authentication (login/register)
  - Auction listings (CRUD operations)
  - Bidding system
  - User profiles

## 📋 For Testers

### Test Account Setup

1. Register with a valid stud.noroff.no email address
2. You'll automatically receive 1000 credits
3. Test both creating listings and bidding on others' items

### Known Limitations

- Email must be from stud.noroff.no domain for registration
- Credits are managed by the API (gained by selling, spent by buying)
- Auction end times are final and cannot be extended
- Images must be valid URLs (not file uploads)

### Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎨 Design & Planning Resources

### Required Project Links

- **📊 Gantt Chart**: [Project Timeline](https://example.com/gantt-chart)
- **🎨 Design Prototype**: [Figma Design](https://example.com/design-prototype)
- **📝 Style Guide**: [Design System](https://example.com/style-guide)
- **📋 Kanban Board**: [Project Management](https://example.com/kanban-board)
- **📁 Repository**: [GitHub Repository](https://github.com/MiaTexnes/Pink-Gavel-Auctions)
- **🌐 Live Demo**: [Hosted Application](https://example.com/live-demo)

## 🛠️ Development Commands

| Command                | Description               |
| ---------------------- | ------------------------- |
| `npm run dev`          | Start development server  |
| `npm run dev:css`      | Watch CSS changes         |
| `npm run build`        | Build for production      |
| `npm run build:css`    | Build CSS for production  |
| `npm run preview`      | Preview production build  |
| `npm run test`         | Run tests in watch mode   |
| `npm run test:run`     | Run tests once            |
| `npm run format`       | Format code with Prettier |
| `npm run format:check` | Check code formatting     |

## 🔍 Troubleshooting

### Common Issues

1. **API Errors**: Ensure you're using a valid stud.noroff.no email for registration
2. **Build Failures**: Run `npm install` to ensure all dependencies are installed
3. **CSS Not Loading**: Run `npm run build:css` to regenerate Tailwind CSS
4. **Port Conflicts**: Vite will automatically use the next available port

### Debug Mode

Enable debug logging by opening browser Developer Tools and monitoring the Console tab.

## 🤝 Contributing

This is a student project for Noroff's Semester Project 2. Contributions are limited to the course requirements and submission guidelines.

## 📄 License

This project is created for educational purposes as part of Noroff's curriculum.

---

**Project Timeline**: May 2025 - September 2025  
**Student**: [Student Name]  
**Course**: Semester Project 2  
**Institution**: Noroff School of Technology and Digital Media
