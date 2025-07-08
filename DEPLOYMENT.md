# 🚀 TimeTracker Deployment Guide

This guide covers deploying TimeTracker to production using Coolify.

## 📋 Prerequisites

- Coolify instance running
- Supabase project set up
- Domain name (optional but recommended)
- Git repository with your code

## 🔧 Coolify Deployment Setup

### Step 1: Prepare Your Repository

1. **Push your code to Git** (GitHub, GitLab, etc.)
2. **Ensure all files are committed**:
   - `Dockerfile`
   - `.dockerignore`
   - `next.config.js`
   - All source code

### Step 2: Configure Coolify

1. **Login to your Coolify dashboard**
2. **Create a new application**:
   - Click "New Application"
   - Select "Docker" as the source
   - Choose your Git repository

3. **Configure the application**:
   - **Name**: `timetracker` (or your preferred name)
   - **Repository**: Your Git repository URL
   - **Branch**: `main` (or your default branch)
   - **Build Pack**: `Dockerfile`

### Step 3: Environment Variables

Add these environment variables in Coolify:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 4: Domain Configuration (Optional)

1. **Add your domain** in Coolify
2. **Configure SSL** (Coolify handles this automatically)
3. **Update Supabase settings**:
   - Add your domain to Supabase Auth settings
   - Update redirect URLs

### Step 5: Deploy

1. **Click "Deploy"** in Coolify
2. **Monitor the build process**
3. **Check logs** if there are any issues

## 🔍 Troubleshooting

### Common Issues

1. **Build fails**:
   - Check if all dependencies are in `package.json`
   - Verify Dockerfile syntax
   - Check build logs in Coolify

2. **Environment variables not working**:
   - Ensure all variables are set in Coolify
   - Check variable names match exactly
   - Restart the application after adding variables

3. **Database connection issues**:
   - Verify Supabase credentials
   - Check if Supabase project is active
   - Ensure RLS policies are configured

### Logs and Monitoring

- **Application logs**: Available in Coolify dashboard
- **Build logs**: Check during deployment
- **Runtime logs**: Monitor for errors

## 🔄 CI/CD Pipeline (Optional)

If you want automatic deployments:

### GitHub Actions (Alternative to Coolify)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Coolify

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Coolify
      uses: coollabsio/coolify-deploy@v1
      with:
        coolify-url: ${{ secrets.COOLIFY_URL }}
        coolify-token: ${{ secrets.COOLIFY_TOKEN }}
        application-id: ${{ secrets.APPLICATION_ID }}
```

## 📊 Post-Deployment

### Health Checks

1. **Test the application**:
   - Visit your domain
   - Test signup/login
   - Verify time tracking works

2. **Monitor performance**:
   - Check response times
   - Monitor resource usage
   - Set up alerts if needed

### Maintenance

1. **Regular updates**:
   - Keep dependencies updated
   - Monitor security patches
   - Backup database regularly

2. **Scaling**:
   - Monitor resource usage
   - Scale up if needed
   - Consider load balancing for high traffic

## 🛡️ Security Considerations

1. **Environment variables**:
   - Never commit secrets to Git
   - Use Coolify's secure environment variable storage
   - Rotate secrets regularly

2. **Database security**:
   - Use strong passwords
   - Enable RLS policies
   - Regular security audits

3. **Application security**:
   - Keep dependencies updated
   - Use HTTPS in production
   - Implement rate limiting

## 📞 Support

If you encounter issues:

1. **Check Coolify documentation**
2. **Review application logs**
3. **Verify environment configuration**
4. **Test locally first**

---

**Happy Deploying! 🎉** 