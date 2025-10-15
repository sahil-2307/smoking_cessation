# QuitSmoking - Smoking Cessation Web App

A comprehensive Progressive Web App (PWA) to help people quit smoking, built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🎯 Core Features
- **Real-time Progress Tracking**: Live quit timer, money saved calculator, and health improvements timeline
- **Craving Management**: SOS button for emergencies, distraction activities, and craving logging
- **Community Support**: Forums, accountability buddies, and peer support
- **Progress Analytics**: Detailed statistics, trigger analysis, and success rate tracking
- **Journal & Notes**: Personal reflection and mood tracking
- **Achievement System**: Badges and milestones to celebrate progress

### 🔐 Authentication & Security
- Email/password authentication with Supabase Auth
- Google OAuth integration
- Row Level Security (RLS) policies
- Protected routes with middleware
- Session management

### 📱 Progressive Web App (PWA)
- Installable on mobile and desktop
- Offline support
- Push notifications (ready)
- App shortcuts for quick actions
- Responsive design

### 🎨 Modern UI/UX
- Built with shadcn/ui components
- Tailwind CSS for styling
- Dark/light mode support (ready)
- Accessibility features
- Mobile-first responsive design

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Recharts** for data visualization
- **Framer Motion** for animations
- **Lucide React** icons

### Backend & Database
- **Supabase** (PostgreSQL database, Authentication, Real-time subscriptions)
- **AWS S3** for file uploads (configured)
- **Next.js API Routes**

### Development & Deployment
- **Vercel** for deployment
- **ESLint** and **TypeScript** for code quality
- **next-pwa** for PWA functionality

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- AWS account (for S3 file uploads - optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smoking-cessation-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your environment variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # AWS S3 (Optional)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=ap-south-1
   AWS_S3_BUCKET_NAME=your_bucket_name
   NEXT_PUBLIC_S3_URL=https://your-bucket.s3.amazonaws.com

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=QuitSmoking
   ```

4. **Set up Supabase database**

   Run the SQL scripts in order:
   ```bash
   # In your Supabase SQL editor, run:
   database/schema.sql
   database/policies.sql
   ```

5. **Configure Supabase Authentication**
   - Enable Email authentication
   - Configure Google OAuth (optional)
   - Set up redirect URLs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://your-domain.com/auth/callback` (production)

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The app uses a PostgreSQL database with the following main tables:

- `profiles` - User profiles and smoking history
- `quit_progress` - Daily progress tracking
- `cravings` - Craving logs with intensity and triggers
- `achievements` - User achievements and badges
- `journal_entries` - Personal journal entries
- `community_posts` - Forum posts and discussions
- `post_comments` - Comments on community posts
- `buddy_connections` - Accountability partner connections
- `user_settings` - User preferences and notifications

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── (protected)/       # Protected routes (requires login)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── cravings/         # Craving management components
│   └── shared/           # Shared components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
│   ├── supabase/         # Supabase client configuration
│   ├── constants.ts      # App constants
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
```

## Key Features Implementation

### 1. Authentication Flow
- Middleware-protected routes
- Session management with Supabase
- Onboarding flow for new users

### 2. Real-time Updates
- Supabase real-time subscriptions
- Live progress tracking
- Community post updates

### 3. PWA Configuration
- Service worker for offline support
- App manifest for installation
- Push notification setup (ready)

### 4. Responsive Design
- Mobile-first approach
- Touch-friendly UI elements
- Cross-platform compatibility

## Deployment

### Vercel Deployment (Recommended)

1. **Connect your repository to Vercel**
   ```bash
   npx vercel
   ```

2. **Set environment variables in Vercel dashboard**
   - Copy all variables from `.env.local`
   - Set build command: `npm run build`
   - Set output directory: `.next`

3. **Update Supabase settings**
   - Add your Vercel domain to Supabase Auth redirect URLs
   - Update CORS settings if needed

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## AWS S3 Setup (Optional)

For user-uploaded images (profile pictures, progress photos):

1. **Create S3 bucket**
   - Region: ap-south-1 (or your preferred region)
   - Enable public read access for uploaded images
   - Configure CORS for web access

2. **Create IAM user**
   - Attach S3 access policy
   - Generate access keys

3. **Update environment variables**
   - Add AWS credentials to `.env.local`

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Optional
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (default: ap-south-1)
- `AWS_S3_BUCKET_NAME` - S3 bucket name
- `NEXT_PUBLIC_S3_URL` - S3 bucket URL

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support & Resources

### Emergency Helplines
- **National Tobacco Cessation Helpline**: 1800-11-2356 (toll-free)
- **Crisis Support**: +91-9820466726 (iCall)

### Additional Resources
- [WHO Tobacco Free Initiative](https://www.who.int/initiatives/tobacco-free-initiative)
- [CDC Smoking Cessation](https://www.cdc.gov/tobacco/quit_smoking/)
- [Indian Tobacco Control](https://www.tobaccofreeindia.com/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ for people committed to a smoke-free life
- Inspired by evidence-based smoking cessation methods
- Community-driven approach to addiction recovery

---

**Remember: You're stronger than your addiction. Every moment smoke-free is a victory! 🌟**