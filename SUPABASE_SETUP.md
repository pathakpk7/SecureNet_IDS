# Supabase Database Setup Guide

## 🔑 Setup Instructions

### Option 1: Get Correct Keys from Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Find your keys:

```
📡 Project URL: https://your-project.supabase.co
🔑 Anon/Public Key: sb_publishable_... (use this for client connections)
🗝️ Service Role Key: sb_secret_... (use this for server-side operations)
```

### Option 2: Update Your .env File

```bash
# Use the publishable key (NOT the secret key)
SUPABASE_KEY=sb_publishable_[YOUR_PUBLISHABLE_KEY]
SUPABASE_URL=https://your-project.supabase.co
```

## 📊 Database Tables Setup

Run these SQL commands in Supabase SQL Editor:

```sql
-- Create alerts table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45),
    attack_type VARCHAR(50),
    risk_level VARCHAR(20),
    confidence FLOAT,
    threat_intel_data JSONB,
    description TEXT,
    source_ip VARCHAR(45),
    destination_ip VARCHAR(45)
);

-- Create logs table
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45),
    protocol VARCHAR(10),
    port INTEGER,
    action VARCHAR(50),
    result VARCHAR(20),
    details JSONB
);

-- Create indexes for better performance
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp);
CREATE INDEX idx_alerts_risk_level ON alerts(risk_level);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_ip_address ON logs(ip_address);
```

## 🚀 Test Connection

```bash
python test_database.py
```

## 📝 Notes

- Always use the **publishable key** for client-side applications
- Use the **service role key** only for server-side operations
- Never commit secret keys to version control
- Keep your keys secure and rotate them regularly

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Python Client Library](https://supabase.com/docs/reference/python)
- [Database Functions](https://supabase.com/docs/guides/functions)
