# 🏀 Viper2kSim: Beginner Friendly Setup & Deployment Guide

Welcome to the **Viper2kSim** Virtual Simulation League Manager! This directory contains step-by-step instructions designed specifically for beginners with no prior coding experience. Follow along to set up, deploy, and style your perfect basketball database.

---

## 🏎️ Quick Start: Admin Portal Credentials
By default, the administrative cockpit is fully activated on your development server.
* **Go to**: Click **Admin Room** in the top-right corner of the website.
* **Default Password**: `admin` or `viper2ksimadmin`

---

## 🛠️ Step 1: Connecting your custom database (Supabase option)

Your application is currently running on a **highly responsive and persistent JSON local engine** that saves automatically on every team creation, roster signup, trade log, and news publication.

If you ever decide to scale this to a full-production Supabase instance, here is how you connect it in less than 5 minutes:

1. **Create an Account**: Go to [Supabase](https://supabase.com) and sign up for a free account.
2. **Create a Project**: Click **New Project**, choose a database password, and choose the server region closest to you.
3. **Run Database Queries (SQL)**:
   * Go to the **SQL Editor** tab on the left-hand menu in your Supabase Dashboard.
   * Click **New Query** and copy-paste the SQL schema below to instantly provision your tables with index keys:

```sql
-- Create Teams Table
create table teams (
  id text primary key,
  name text not null,
  abbrev varchar(5) not null,
  conference text check (conference in ('East', 'West')),
  division text,
  logo text,
  banner text,
  wins integer default 0,
  losses integer default 0,
  streak text default 'None',
  pts_for numeric default 110.0,
  pts_against numeric default 110.0
);

-- Create Players Table
create table players (
  id text primary key,
  team_id text references teams(id) on delete cascade,
  name text not null,
  position varchar(5),
  age integer,
  rating integer,
  ppg numeric,
  rpg numeric,
  apg numeric,
  spg numeric,
  bpg numeric,
  contract text
);

-- Create News Table
create table news (
  id text primary key,
  title text not null,
  content text,
  image text,
  category text,
  team_id text references teams(id) on delete set null,
  date timestamp with time zone default timezone('utc'::text, now())
);

-- Create Power Rankings Table
create table power_rankings (
  team_id text primary key references teams(id) on delete cascade,
  rank integer,
  prev_rank integer,
  movement text,
  notes text
);

-- Create Trades Table
create table trades (
  id text primary key,
  date text,
  team_a_id text references teams(id),
  team_b_id text references teams(id),
  team_a_receives text[],
  team_b_receives text[],
  details text
);

-- Create Draft Results Table
create table draft_results (
  id text primary key,
  year integer,
  round integer,
  pick integer,
  team_id text references teams(id) on delete cascade,
  player_name text,
  position text,
  college text
);

-- Create Awards Table
create table awards (
  id text primary key,
  year text,
  category text,
  player_name text,
  team_id text references teams(id) on delete cascade,
  stats_line text
);
```

4. **Add URL Credentials to App Settings**:
   * Go to your Supabase Project **Settings** -> **API**.
   * Copy the `Project URL` and `anon public` Key.
   * Paste them in AI Studio’s **Settings -> Secrets Panel** under the keys `SUPABASE_URL` and `SUPABASE_KEY`.

---

## ☁️ Step 2: Deploying On Replit

Replit is an excellent service for hosting this full-stack interactive simulation app. Here is a foolproof guide:

1. **Export Code from AI Studio**:
   * Open the Settings/File Menu in AI Studio in the top corner.
   * Click **Export Workspace as ZIP** to download a clean offline package of Viper2kSim on your PC.
2. **Create a Replit Repl**:
   * Go to [Replit](https://replit.com) and log in.
   * Click **Create Repl**, select **Node.js** or **Blank Repl** as your template.
3. **Upload Files**:
   * Extract your ZIP file on your computer.
   * Drag-and-drop all files directly into the Replit file explorer.
4. **Environment Variables**:
   * Navigate to the **Secrets / Tools (Padlock Icon)** tab in your Replit sidebar.
   * Add a secret key called `PORT` with the value `3000`.
   * Add the `GEMINI_API_KEY` with your secret key, if you wish to enable further background AI automations.
5. **Run**:
   * Hit the green **Run** button at the top! Replit will automatically read the `package.json` configurations, launch your Express Node server on port 3000, and show your live interactive league website in the webview.

---

## 🖼️ Step 3: Uploading Your Custom Team Logos & Banners

You do not need to write code to swap out logos or decorate banners. You can manage everything through your live **Franchise Directory Editor** inside the **Admin Portal**.

### Option A: Standard Custom Emojis (Visual Easiest)
* For immediate high-definition scaling, use standard visual system emojis.
* Go to the **Admin Room -> Franchise Identity**.
* Edit a team (e.g. Los Angeles Vipers) and paste any emoji into the `Logo` field (such as `🔥`, `⚡`, `🦈`, `👑`, `🍀`).

### Option B: Cloud Image Hosting URLs
* Go to any free cloud image hosting provider (e.g. [Imgur](https://imgur.com) or [Postimages](https://postimages.org)).
* Upload your `.png` or `.svg` team logo.
* Copy the **Direct Link** (this must end with `.png`, `.jpg`, or `.svg`).
* In your Admin tab on Viper2kSim, click **Edit** on your team, and paste that exact URL into the `Logo Icon` field. They will render beautifully inside the clickable circular medallions!

### Option C: Custom CSS Background Gradient Banners
* Each team page displays a distinctive, stylized banner.
* You can define any CSS style or color gradient rules in the `Banner` field. E.g.:
  * Dark Charcoal: `linear-gradient(135deg, #090d16 0%, #1e3a8a 100%)`
  * Venom Green: `linear-gradient(135deg, #111827 0%, #064e3b 50%, #047857 100%)`
  * Sunset Amber: `linear-gradient(135deg, #7c2d12 0%, #db2777 100%)`

---

### Congratulations! Your Viper2kSim League Hub is ready to dominate! 🐍🏀
