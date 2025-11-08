# Budget Tracker - Professional Budget Management Application

A full-featured budget tracking web application built with Next.js 14, TypeScript, and Prisma. Track your income, expenses, budgets, and financial goals with ease. Available in both Hungarian and English.

## Features

✨ **Core Features:**
- 🔐 User authentication with NextAuth.js
- 💰 Budget management (create, edit, delete budgets)
- 💸 Transaction tracking (income and expenses)
- 🏷️ Category management with custom icons and colors
- 📊 Dashboard with financial overview and analytics
- 🔄 Recurring transactions support (planned)
- 📈 Reports and data export (planned)
- 🌍 Multi-language support (Hungarian and English)
- 📱 Fully responsive design
- 🎨 Professional UI with Tailwind CSS and shadcn/ui

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **Database:** PostgreSQL (Vercel Postgres)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Internationalization:** next-intl
- **Deployment:** Vercel

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (for production) or SQLite (for development)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/budget-tracker.git
cd budget-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database (for local development use SQLite)
DATABASE_URL="file:./dev.db"

# For production with PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/budget_tracker"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# App Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate a secure secret for NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates database tables)
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create your first user

Navigate to the sign-up page and create an account. You can then start adding budgets, categories, and transactions!

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/budget-tracker)

### Manual Deployment

1. **Push your code to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Create a new project on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Set up Vercel Postgres**
   - In your Vercel project, go to the "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Follow the prompts to create your database
   - Vercel will automatically add the `DATABASE_URL` environment variable

4. **Add environment variables**

   In your Vercel project settings, add these environment variables:

   ```
   NEXTAUTH_SECRET=<generate-a-secure-random-string>
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   ```

5. **Deploy**
   - Vercel will automatically deploy your app
   - After deployment, run migrations:

   ```bash
   # Connect to your Vercel Postgres database and run:
   npx prisma migrate deploy
   ```

6. **Access your app**
   - Your app will be live at `https://your-app-name.vercel.app`

## Database Schema

The application uses the following main models:

- **User**: User accounts with authentication
- **Budget**: Budget management
- **Category**: Transaction categories
- **Transaction**: Income and expense records
- **RecurringTransaction**: Automated recurring transactions

See `prisma/schema.prisma` for the complete schema.

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── [locale]/            # Internationalized routes
│   │   ├── (dashboard)/     # Dashboard pages
│   │   └── auth/            # Authentication pages
│   └── api/                 # API routes
├── components/              # React components
│   └── ui/                  # UI components (shadcn/ui)
├── lib/                     # Utility functions
├── messages/                # i18n translations
│   ├── en.json             # English translations
│   └── hu.json             # Hungarian translations
├── prisma/                  # Prisma schema and migrations
└── public/                  # Static assets
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Prisma Commands

- `npx prisma generate` - Generate Prisma Client
- `npx prisma migrate dev` - Create and apply migrations in development
- `npx prisma migrate deploy` - Apply migrations in production
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db push` - Push schema changes without creating migrations

## Changing Database Provider

### For Local Development (SQLite)

In `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### For Production (PostgreSQL)

In `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

After changing, run:
```bash
npx prisma generate
npx prisma migrate dev
```

## Features Roadmap

- [x] User authentication
- [x] Budget management
- [x] Transaction tracking
- [x] Category management
- [x] Dashboard with overview
- [x] Multi-language support (HU/EN)
- [x] Responsive design
- [ ] Recurring transactions
- [ ] Advanced reports and analytics
- [ ] Data export (CSV, PDF)
- [ ] Budget alerts and notifications
- [ ] Dark mode
- [ ] Mobile app (React Native)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
