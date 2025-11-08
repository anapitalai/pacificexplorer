# Pacific Explorer 🏝️

A beautiful, satellite-powered tourism platform for discovering Papua New Guinea's hidden wonders.

![PNG Colors](https://img.shields.io/badge/PNG-Colors-CE1126?style=for-the-badge)
![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2014-000000?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind-38bdf8?style=for-the-badge&logo=tailwind-css)

## 🌺 About

Pacific Explorer is a Next.js web application that leverages EU space technologies (Copernicus, Galileo, IRIS²) to help tourists discover remote islands, pristine reefs, majestic mountains, and vibrant cultures across Papua New Guinea.

**Built for the Cassini Hackathon 2025 - Beyond Horizons Challenge**

## ✨ Features

- 🛰️ **Satellite-Powered Discovery** - View real-time Copernicus satellite imagery
- 🏖️ **Hidden Gems** - Discover remote beaches, reefs, waterfalls, and cultural sites
- 🌿 **Eco-Conscious Travel** - Monitor coral health and coastal conditions
- 🎨 **PNG-Themed Design** - Beautiful UI featuring Papua New Guinea's national colors and the Bird of Paradise
- 📱 **Mobile-First** - Fully responsive design optimized for all devices
- ⚡ **Fast & Modern** - Built with Next.js 14, TypeScript, and Tailwind CSS v4

## 🎨 Design

The landing page features:
- **PNG National Colors**: Red (#CE1126), Yellow (#FCD116), Black (#000000)
- **Bird of Paradise**: Custom SVG graphics celebrating PNG's national bird
- **Ocean Theme**: Gradients inspired by the Pacific Ocean
- **Smooth Animations**: Fade-in, slide-up, and floating effects
- **Interactive Cards**: Hover effects and category exploration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to the project directory
cd pacific-explorer

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## � Deployment

### Production Server
The application is deployed and running at: **https://170.64.195.201**

### Automated Deployment
```bash
# Quick deployment to production
./deploy-pipeline.sh
```

### Manual Deployment
See the [Deployment Guide](./DEPLOYMENT.md) for detailed instructions.

### Environment Setup
- Copy `.env` to `.env.production` and update production values
- Configure database connection and authentication secrets
- Set up SSL certificates for HTTPS

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f
```

## �🗂️ Project Structure

```
pacific-explorer/
├── app/
│   ├── globals.css          # Global styles with PNG color palette
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── BirdOfParadise.tsx   # Bird of Paradise SVG component
│   └── PNGPattern.tsx       # PNG tribal pattern component
├── public/                   # Static assets
├── next.config.ts            # Next.js configuration
└── tsconfig.json             # TypeScript configuration
```

## 🎨 Color Palette

### PNG National Colors
- **Red**: `#CE1126` - PNG flag red
- **Yellow**: `#FCD116` - PNG flag yellow/gold
- **Black**: `#000000` - PNG flag black

### Pacific Ocean Theme
- Ocean 400: `#38bdf8`
- Ocean 500: `#0ea5e9`
- Ocean 600: `#0284c7`
- Ocean 700: `#0369a1`

### Paradise Theme
- Green: `#10B981`
- Coral: `#F97316`
- Sand: `#FEF3C7`
- Sky: `#38BDF8`

## 🧩 Components

### BirdOfParadise
Custom SVG component featuring PNG's national bird with:
- Elaborate tail feathers in red and yellow
- Head plumes and crown
- Wings and decorative feather tips
- Optional floating animation

### PNGPattern
Traditional tribal pattern component for backgrounds

## 🛠️ Built With

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React 19](https://react.dev/)** - UI library

## 📱 Responsive Design

The app is mobile-first and fully responsive:
- Mobile: Optimized for small screens
- Tablet: Adaptive layouts
- Desktop: Full-width experience with max-width constraints

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## � Documentation

Comprehensive documentation is available in the [`documentation/`](./documentation/) folder:

- **Getting Started**: [Quick Start Guide](./documentation/QUICK_START.md)
- **Authentication**: [Auth System](./documentation/AUTH_SYSTEM_UPDATE.md), [Admin Account](./documentation/DEFAULT_ADMIN_ACCOUNT.md)
- **Database**: [Reset Guide](./documentation/DATABASE_RESET_GUIDE.md), [OSM Integration](./documentation/OSM_INTEGRATION_COMPLETE.md)
- **Features**: [Hotels Management](./documentation/HOTELS_MANAGEMENT_COMPLETE.md), [Satellite Maps](./documentation/COPERNICUS_IMAGERY_UPDATE.md)
- **Deployment**: [Docker](./documentation/DOCKER_DEPLOYMENT.md), [Server Setup](./documentation/DEPLOY_TO_SERVER.md)

📖 **[View Full Documentation Index](./documentation/README.md)**

## 🔮 Future Features

Potential enhancements:
- Advanced booking system
- Multi-language support
- Mobile app (React Native)
- Offline PWA support
- Community reviews and ratings
- AI-powered trip recommendations

## 📄 License

MIT License

## 🤝 Contributing

This is a Cassini Hackathon project. Contributions welcome after the competition!

## 👥 Team

Built for Papua New Guinea 🇵🇬

## 🙏 Acknowledgments

- Cassini Hackathon 2025
- Copernicus EU Space Programme
- Galileo Navigation System
- Tourism PNG
- The people and cultures of Papua New Guinea

---

**Built with ❤️ for Papua New Guinea**
