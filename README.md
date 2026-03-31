# SiteForge AI - Enterprise SaaS Website Builder Platform

A modern, AI-first SaaS platform for building and managing websites with comprehensive business tools. Built with React, TypeScript, Tailwind CSS v4, and designed as a Progressive Web App (PWA).

## 🌟 Features

### Core Platform
- **AI Website Builder**: Generate complete websites instantly with AI assistance
- **Multi-Page Routing**: Full React Router implementation with 15+ pages
- **Responsive Design**: Optimized for desktop (1440px+), tablet (768px), and mobile (320px-480px)
- **Progressive Web App**: Installable app experience on Android, iOS, and desktop
- **Dark/Light Mode**: Complete theme system with smooth transitions
- **Mobile-First**: Bottom navigation, touch-friendly UI, collapsible sidebars

### Business Management
- **Dashboard**: Real-time analytics, revenue tracking, order overview
- **Order Management**: Full order lifecycle with refunds, cancellations, and tracking
- **Inventory**: Product management with stock alerts and bulk operations
- **Customer Management**: Customer profiles, purchase history, and segmentation
- **Analytics**: Charts, graphs, traffic sources, and performance metrics
- **Marketing**: Email campaigns, SMS, social media, and coupon management
- **Blog CMS**: Create and manage blog content with SEO optimization
- **Payment Processing**: Stripe, PayPal, Clover, NMI gateway integration

### Additional Modules
- **Training Center**: Employee onboarding with courses and progress tracking
- **Marketplace**: App store for integrations and plugins
- **Integrations**: Connect Google Analytics, Facebook, Instagram, WhatsApp
- **Settings**: Profile, business, security, and notification preferences

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18.3.1 with TypeScript
- **Routing**: React Router v7 (Data Mode)
- **Styling**: Tailwind CSS v4 + Custom Design System
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts
- **Animations**: Motion (Framer Motion)
- **State Management**: React Hooks
- **Forms**: React Hook Form
- **Icons**: Lucide React

### Project Structure
```
/src
  /app
    /components
      /ui           # Reusable UI components
      header.tsx    # Top navigation
      sidebar.tsx   # Desktop sidebar
      mobile-nav.tsx # Mobile bottom navigation
      theme-provider.tsx
    /layouts
      dashboard-layout.tsx
    /pages
      landing.tsx   # Marketing landing page
      auth.tsx      # Login/signup with MFA
      onboarding.tsx # AI onboarding flow
      /dashboard
        home.tsx
        website-builder.tsx
        orders.tsx
        order-details.tsx
        inventory.tsx
        customers.tsx
        payments.tsx
        analytics.tsx
        marketing.tsx
        blog.tsx
        tutor.tsx
        marketplace.tsx
        integrations.tsx
        settings.tsx
    /lib
      mock-data.ts  # Mock data for demo
    routes.tsx
    App.tsx
  /styles
    theme.css      # Design tokens
    tailwind.css
    index.css
/public
  manifest.json    # PWA configuration
```

## 📱 Responsive Design

### Desktop (1440px+)
- Full sidebar navigation
- Three-column layouts
- Expanded data tables
- Advanced analytics dashboards

### Tablet (768px)
- Collapsible sidebar
- Two-column layouts
- Compact tables
- Touch-optimized buttons

### Mobile (320px-480px)
- Bottom tab navigation
- Single-column layouts
- Card-based lists
- Swipe gestures
- Floating action buttons

## 🎨 Design System

### Colors
- **Primary**: Purple gradient (#8B5CF6)
- **Accent**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: System font stack
- **Headings**: Bold, responsive sizes
- **Body**: Regular weight
- **Labels**: Medium weight

### Components
- Rounded corners (0.625rem default)
- Soft shadows
- Smooth transitions
- Consistent spacing (4px grid)

## 🚀 Getting Started

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Environment
The platform uses mock data for demonstration. To connect to a real backend:
1. Set up authentication (e.g., Supabase Auth)
2. Configure database connection
3. Update API endpoints in components
4. Add environment variables

## 📊 Features by Page

### Landing Page
- Hero section with CTA
- Feature showcase
- Industry carousel
- Customer testimonials
- Pricing section
- Responsive navigation

### Authentication
- Login/Signup tabs
- Multi-factor authentication
- Social login (Google, GitHub)
- Password reset
- Remember me

### AI Onboarding
- 4-step wizard
- Business information collection
- Industry selection
- AI website generation
- Progress indicators

### Dashboard Home
- Revenue, orders, visitors, conversion metrics
- Revenue/orders trend charts
- Recent orders list
- Low stock alerts
- AI recommendations

### Orders
- Searchable order list
- Status filtering
- Order details view
- Refund processing (full/partial)
- Order cancellation
- Timeline tracking

### Inventory
- Product grid/list view
- Stock level tracking
- Low stock alerts
- Bulk operations
- Product variants
- Category filtering

### Website Builder
- Drag-and-drop components
- Desktop/mobile preview
- Live editing
- AI enhancement
- Page management
- Style customization

### Analytics
- Revenue trends
- Traffic sources (pie chart)
- Visitor analytics
- Top products (bar chart)
- Conversion tracking
- Date range filtering

### Settings
- Profile management
- Business details
- Password change
- Two-factor authentication
- Email notifications
- Theme preferences

## 🔐 Security Features

- Multi-factor authentication (MFA)
- Role-based access control
- Secure password requirements
- Session management
- Device tracking
- Activity logs

## 📈 Performance

- Lazy loading for routes
- Optimized images
- Code splitting
- Responsive images
- Efficient re-renders
- PWA caching strategies

## 🌐 Internationalization Ready

The platform is designed to support:
- Multi-language content
- Multi-currency payments
- Localized date/time formats
- Regional payment methods
- Geo-based pricing

## 🎯 Use Cases

1. **E-commerce**: Full online store with inventory and orders
2. **Restaurants**: Menu management and online ordering
3. **Services**: Appointment booking and client management
4. **Education**: Course delivery and student tracking
5. **Non-Profit**: Donation campaigns and volunteer management
6. **Events**: Ticket sales and attendee management

## 🛠️ Customization

### Adding New Pages
1. Create page component in `/src/app/pages/dashboard/`
2. Add route in `/src/app/routes.tsx`
3. Add navigation item in sidebar/mobile-nav
4. Create mock data if needed

### Theming
Modify `/src/styles/theme.css` to customize:
- Color palette
- Typography
- Border radius
- Shadows
- Spacing

### Components
All UI components are in `/src/app/components/ui/` and can be customized individually.

## 📝 Mock Data

The platform includes comprehensive mock data:
- 5 sample orders
- 5 products with inventory
- 3 customers
- 3 blog posts
- 3 training courses
- 4 marketplace apps
- Analytics data with trends

## 🚀 Deployment

The platform is ready to deploy to:
- Vercel
- Netlify
- AWS Amplify
- Cloudflare Pages

Build command: `pnpm build`
Output directory: `dist`

## 📱 PWA Features

- Add to Home Screen
- Offline support (basic)
- Push notifications ready
- App-like experience
- Fast loading
- Background sync ready

## 🎓 Learning Resources

The platform demonstrates:
- Modern React patterns
- TypeScript best practices
- Responsive design techniques
- Component composition
- State management
- Form handling
- Data visualization
- Animation principles

## 📄 License

This is a demonstration project built with Figma Make.

## 🙏 Acknowledgments

- Built with Figma Make
- UI components from shadcn/ui
- Icons from Lucide
- Images from Unsplash
- Charts from Recharts
- Animations from Motion

---

**Note**: This is a frontend prototype using mock data. For production use, integrate with a backend service like Supabase, Firebase, or a custom API.
