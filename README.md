# Budget Tracker - Professional Budget Management Application

A full-featured budget tracking web application built with Next.js 14, TypeScript, and Prisma. Track your income, expenses, budgets, and financial goals with ease. Available in both Hungarian and English.

## Features

✨ **Core Features:**
- 🔐 User authentication with NextAuth.js
- 💰 Budget management (create, edit, delete budgets)
- 💸 Transaction tracking (income and expenses)
- 🏷️ Category management with custom icons and colors
- 📊 Dashboard with financial overview and analytics
- 🔄 Recurring transactions (daily, weekly, monthly, yearly)
- 📈 Advanced reports with interactive charts
- 📥 Data export (CSV and PDF)
- 🌙 Dark mode with theme switching
- 📱 Progressive Web App (PWA) with offline support
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
- **Charts:** Recharts
- **Theme:** next-themes (dark mode)
- **PDF Export:** jsPDF + jspdf-autotable
- **PWA:** Service Worker + Web App Manifest
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

Create a `.env` file in the root directory (minimal configuration):

```env
# Database (for local development use SQLite)
DATABASE_URL="file:./dev.db"

# For production with PostgreSQL (Vercel auto-provides this):
# DATABASE_URL="postgresql://user:password@localhost:5432/budget_tracker"

# NextAuth (only required variable)
NEXTAUTH_SECRET="your-secret-key-here"
```

Generate a secure secret for NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

**Note:** Vercel automatically provides `DATABASE_URL` when you add Vercel Postgres. `NEXTAUTH_URL` is auto-detected in production.

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

   In your Vercel project settings, add only this environment variable:

   ```
   NEXTAUTH_SECRET=<generate-a-secure-random-string>
   ```

   **Note:** Vercel automatically provides `DATABASE_URL` from Postgres and `NEXTAUTH_URL` is auto-detected.

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
│   │   │   ├── budgets/     # Budget management
│   │   │   ├── categories/  # Category management
│   │   │   ├── dashboard/   # Overview dashboard
│   │   │   ├── recurring/   # Recurring transactions
│   │   │   ├── reports/     # Reports & charts
│   │   │   ├── settings/    # User settings
│   │   │   └── transactions/ # Transaction management
│   │   └── auth/            # Authentication pages
│   └── api/                 # API routes
│       ├── auth/            # NextAuth endpoints
│       ├── budgets/         # Budget CRUD
│       ├── categories/      # Category CRUD
│       ├── recurring/       # Recurring transaction CRUD
│       └── transactions/    # Transaction CRUD
├── components/              # React components
│   ├── ui/                  # UI components (shadcn/ui)
│   ├── theme-provider.tsx   # Dark mode provider
│   ├── theme-toggle.tsx     # Theme switch component
│   └── recurring-dialog.tsx # Recurring transaction form
├── lib/                     # Utility functions
│   └── export.ts            # CSV/PDF export utilities
├── messages/                # i18n translations
│   ├── en.json             # English translations
│   └── hu.json             # Hungarian translations
├── prisma/                  # Prisma schema and migrations
└── public/                  # Static assets
    ├── manifest.json        # PWA manifest
    └── sw.js                # Service Worker
```

## Detailed Features

### 🔄 Recurring Transactions
- Create transactions that automatically repeat
- Frequency options: Daily, Weekly, Monthly, Yearly
- Customizable start date and next occurrence
- Active/inactive status management
- Automatic calculation of next occurrence date

### 📈 Advanced Reports & Charts
- **Category Breakdown**: Pie chart showing expense distribution by category
- **Income vs Expense**: Bar chart comparing income and expenses
- **Monthly Trends**: Line chart showing financial trends over the last 6 months
- Interactive charts built with Recharts
- Date range filtering
- Real-time data updates

### 📥 Data Export
- **CSV Export**: Download all transactions in spreadsheet format
- **PDF Export**: Professional formatted PDF reports with:
  - Transaction list with all details
  - Summary section (total income, expenses, balance)
  - Automatic table formatting with jsPDF-autotable

### 🌙 Dark Mode
- Toggle between Light, Dark, and System theme
- Persistent theme preference
- Smooth transitions between themes
- System preference detection

### 📱 Progressive Web App (PWA)
- Install on mobile devices like a native app
- Offline support with Service Worker
- Cache-first strategy for optimal performance
- App icons and splash screens
- Standalone display mode

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
- [x] Recurring transactions
- [x] Advanced reports and analytics
- [x] Data export (CSV, PDF)
- [x] Dark mode
- [x] Progressive Web App (PWA)
- [x] Budget alerts and notifications
- [x] Email notifications
- [x] Mobile app companion

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
