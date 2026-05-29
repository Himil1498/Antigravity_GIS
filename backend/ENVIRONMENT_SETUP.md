# 🌍 Environment Setup & Deployment Guide

## 📊 Overview

| Environment     | Frontend URL            | Backend API                  | Database Host  | Use Case     |
| :-------------- | :---------------------- | :--------------------------- | :------------- | :----------- |
| **Development** | `http://localhost:3005` | `http://localhost:82/api`    | `localhost`    | Daily Coding |
| **Production**  | `http://172.16.20.11`   | `http://172.16.20.11:82/api` | `172.16.20.11` | Live Server  |

---

## 💻 1. Development Mode (Local Laptop)

**Use this mode when you are coding.**

### Step 1: Switch Configuration

**IMPORTANT:** Always run this before starting work to avoid connecting to the live production database.

```bash
# In Backend folder:
npm run switch:dev

# In Frontend folder:
npm run switch:dev
```

### Step 2: Start Servers

1.  **Backend**: `npm run dev` (Runs on Port 82)
2.  **Frontend**: `npm start` (Runs on Port 3005)

### 🗄️ Development Database Credentials

- **Host**: `localhost`
- **Port**: `3306`
- **User**: `root`
- **Password**: `Ved@1498@!!`
- **Database**: `opticonnect_gis_db`

---

## 🚀 2. Production Mode (Ubuntu Server)

**Use this mode for the deployed server at `172.16.20.11`.**

### Step 1: Architecture

The architecture for Ubuntu is streamlined for performance:

- **Frontend**: Served as **Static Files** via **Nginx** on Port **80**.
- **Backend**: Runs internally on Port **3000** (using PM2), exposed via **Nginx** on Port **82**.

### Step 2: Prepare for Deployment

```bash
# 1. Switch Backend to Production config
cd Backend
npm run switch:prod

# 2. Build Frontend for Production
cd Frontend
npm run build:prod
# (Output is in 'build/' folder)
```

### 🗄️ Production Database Credentials

- **Host**: `172.16.20.11`
- **Port**: `3306`
- **User**: `root`
- **Password**: `Optimal@123`
- **Database**: `opticonnect_gis_db`

---

## ⚠️ Troubleshooting

**1. "I see too many users / live data on my laptop!"**

- **Cause**: Your `.env` file is pointing to `172.16.20.11`.
- **Fix**: Run `npm run switch:dev` in the Backend folder and restart.

**2. "Frontend can't connect to Backend"**

- **Check**: Is the Backend running? (`http://localhost:82/api/health`)
- **Check**: Did you run `npm run switch:dev` in the **Frontend** folder? The frontend needs to know to look for `localhost:82`.
