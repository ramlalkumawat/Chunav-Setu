# 🇮🇳 Chunav Setu (चुनाव सेतु)

**Chunav Setu** is an end-to-end Election Campaign Management and Voter Intelligence Platform designed for candidates, campaign teams, and field workers.

## 🚀 Features

- **📊 Central Command Dashboard**: Real-time voter metrics, booth status, and live field updates.
- **🗳️ Smart Voter Management (मतदाता सूची)**: Search, filter, family grouping, slip generation, and voting status tracking.
- **📍 Booth Level Strategy (बूथ प्रबंधन)**: Strength categorization, volunteer assignment, and target tracking.
- **🤝 Volunteer & Karyakarta Management (कार्यकर्ता नेटवर्क)**: Hierarchy levels, duty rosters, and real-time activity tracking.
- **📢 Campaign Broadcasts & WhatsApp**: Quick communication templates, rally alerts, and announcements.
- **🚨 Issue & Grievance Tracker**: Rapid response resolution with geo-tagging and priority workflows.
- **⚡ Dual Mode Backend**: Works seamlessly with Supabase Cloud DB or local fallback mock DB.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Database / Auth**: Supabase (PostgreSQL + RLS)
- **Charts**: Recharts

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ramlalkumawat/Chunav-Setu.git
cd Chunav-Setu
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file from `.env.example`:
```bash
cp .env.example .env.local
```
Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 License
Private & Proprietary.
