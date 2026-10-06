# Bondhu Association Manager

A mobile-friendly browser prototype for a friends association. It includes demo sign-in and member registration, role-specific Admin/Accountant/Member screens, monthly/yearly/other contributions, expenses, investments, audit history, a balance certificate, spreadsheet exports, printable reports, and BDT calculations.

## Run locally

**Windows, no installation:** double-click [run.bat](run.bat) or open [index.html](index.html) in a browser.

The app is static HTML/CSS/JavaScript, so the core app does not require Node.js or a build step. For Vite development instead, install Node.js 18 or newer, run `npm install`, then `npm start`.

## Data and privacy

This is currently a local demo, not a production authentication system or online database. Accounts and association records are stored in the browser's LocalStorage under `bondhu-association-v1`; the signed-in session uses session storage. Passwords are PBKDF2-hashed in the browser, but a user controlling the browser can alter local records and roles. Do not enter real member data or reuse real passwords. Clearing browser site data removes saved records.

Demo accounts (password for each: `bondhu123`):

- Admin: `admin@bondhu.local`
- Accountant: `accounts@bondhu.local`
- Member: `member@bondhu.local`

Member registration creates a member account and links it to an existing member with the same email when possible. Admin can manage member records; Accountant can enter finances; Member sees their own contribution records. CSV exports open in Excel. The PDF buttons use the browser's print dialog; select “Save as PDF”.

## Online database schema (Supabase)

The PostgreSQL schema and row-level security policies are in [database/schema.sql](database/schema.sql). To provision it, create a Supabase project, run that SQL in its SQL Editor, enable email/password Auth, and create the first trusted administrator account. Then use the commented admin-bootstrap SQL at the end of the schema to assign that account the `admin` role. New signups receive the `member` role automatically. Promote accountants only through trusted SQL or a secured admin service.

This creates the online database structure, but this static demo still uses LocalStorage for the UI and does **not** connect/sync to Supabase yet. A live integration requires the Supabase project URL and public anon key plus replacing the local sign-in/data layer with Supabase Auth and database queries. Never put a service-role key in browser code. The schema enforces permissions with RLS; keep those rules enabled. Do not use the local demo authentication for real member accounts.

## Features

- Dashboard with fund balance, contributions, expenses, members, and a monthly chart
- Member directory with search, add, and admin delete actions
- Monthly, yearly, and other contributions; expense and investment ledgers
- Audit log and member balance confirmation certificate
- CSV spreadsheet exports and print-to-PDF reports
- Demo authentication, member registration, and role-based navigation/actions
- Contribution split calculator for Bangladeshi Taka (BDT)
- Responsive layouts for desktop, tablet, and mobile
