# Vercel Environment Variables

Add these environment variables to your Vercel project:

## Required Variables

### Convex Configuration (Copy These Exactly)

```
PUBLIC_CONVEX_URL=https://modest-starfish-493.convex.cloud
```

```
CONVEX_DEPLOY_KEY=dev:modest-starfish-493|eyJ2MiI6IjI1MDViNTc5MTExNzQ1M2ZiM2RlMTcyZTc3NzZhYzg4In0=
```

```
CONVEX_URL=https://modest-starfish-493.convex.cloud
```

```
CONVEX_DEPLOYMENT=dev:modest-starfish-493
```

## Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Open https://vercel.com/dashboard
   - Select your `ai-playground` project

2. **Navigate to Environment Variables**
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

3. **Add Each Variable**
   - For each variable above:
     - Click "Add New"
     - Paste the variable name in "Key" field
     - Paste the value in "Value" field
     - Select all environments: Production ✓, Preview ✓, Development ✓
     - Click "Save"

4. **Variables to Add (4 total):**
   
   | Key | Value |
   |-----|-------|
   | `PUBLIC_CONVEX_URL` | `https://modest-starfish-493.convex.cloud` |
   | `CONVEX_DEPLOY_KEY` | `dev:modest-starfish-493\|eyJ2MiI6IjI1MDViNTc5MTExNzQ1M2ZiM2RlMTcyZTc3NzZhYzg4In0=` |
   | `CONVEX_URL` | `https://modest-starfish-493.convex.cloud` |
   | `CONVEX_DEPLOYMENT` | `dev:modest-starfish-493` |

5. **Redeploy**
   - After adding all variables, go to the "Deployments" tab
   - Click on the three dots menu on the latest deployment
   - Select "Redeploy"

## What Each Variable Does
- `PUBLIC_CONVEX_URL` - Used by frontend to connect to Convex
- `CONVEX_DEPLOY_KEY` - Authentication for deployment
- `CONVEX_URL` - Backend Convex connection
- `CONVEX_DEPLOYMENT` - Specifies which Convex deployment to use

## Important Notes
- These are for your development deployment
- For production, you may want to create a separate Convex production deployment
- Make sure to copy the CONVEX_DEPLOY_KEY exactly as shown (including the pipe character |)