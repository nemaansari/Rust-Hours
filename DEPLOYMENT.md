# Deployment Guide - Rust Hours Discord Bot

## Discord Developer Portal Setup

### 1. Create Discord Application
1. Visit [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Enter application name (e.g., "Rust Hours Bot")
4. Click **"Create"**

### 2. Configure Bot Settings
1. Go to **"Bot"** section in left sidebar
2. Click **"Add Bot"** if not already created
3. **Critical Public Bot Settings:**
   - ✅ **Public Bot: ON** (THIS IS ESSENTIAL - allows anyone to invite your bot)
   - ❌ **Requires OAuth2 Code Grant: OFF** (allows simple invite links)
   - ❌ Server Members Intent: OFF (not needed)
   - ❌ Presence Intent: OFF (not needed)
   - ❌ Message Content Intent: OFF (not needed)

**⚠️ IMPORTANT:** If "Public Bot" is OFF, only you can invite the bot to servers!

### 3. Get Required Credentials
1. **Bot Token**: In "Bot" section, click **"Reset Token"** and copy
2. **Application ID**: In "General Information" section, copy "Application ID"

### 4. Generate Public Invite Link
Create a permanent invite link that anyone can use:

**For Rust Hours Bot:**
```
https://discord.com/oauth2/authorize?client_id=1385626383115489320&permissions=2048&scope=bot%20applications.commands
```

**Alternative Shorter Link (using Discord's link shortener):**
1. Go to **"OAuth2" > "URL Generator"** in Discord Developer Portal
2. Select **"bot"** and **"applications.commands"** scopes
3. Select **"Send Messages"** permission (2048)
4. Copy the generated URL

**Permissions Breakdown:**
- `2048` = Send Messages (for slash command responses)
- `bot` = Add bot to server
- `applications.commands` = Use slash commands

## Making Your Bot Discoverable

### Popular Bot Directory Websites
Once your bot is deployed and stable, submit it to these platforms:

1. **Top.gg** (https://top.gg)
   - Most popular bot directory
   - Requires 1+ servers and detailed description
   - Free listing with optional premium features

2. **Discord.bots.gg** (https://discord.bots.gg)
   - Large community of bot users
   - Free submissions
   - Good for gaming-related bots

3. **Bots on Discord** (https://bots.ondiscord.xyz)
   - Clean interface
   - Free bot listings
   - Good SEO visibility

4. **Discord Bot List** (https://discordbotlist.com)
   - Established directory
   - Active community
   - Free submissions

### Submission Requirements (Typical)
- ✅ Bot must be online and functional
- ✅ At least 1-5 servers using the bot
- ✅ Clear description of bot's purpose
- ✅ Screenshots/examples of bot in action
- ✅ Proper avatar and bot name
- ✅ Working invite link
- ✅ Privacy policy (for larger bots)

### Creating Marketing Materials
For bot directories, you'll need:

1. **Bot Avatar** - 512x512px image representing your bot
2. **Description** - Clear explanation of what your bot does
3. **Screenshots** - Examples of the bot's embed responses
4. **Tags** - "gaming", "rust", "statistics", "battlemetrics"
5. **Invite Link** - The public link you generated above

## Deployment Options

### Option 1: Railway (Recommended - Free Tier)
1. Fork this repository to your GitHub
2. Visit [Railway.app](https://railway.app)
3. Connect your GitHub account
4. Create new project from your forked repo
5. Add environment variables:
   - `DISCORD_TOKEN` = your bot token
   - `CLIENT_ID` = your application ID
6. Deploy automatically triggers

### Option 2: Heroku
1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Clone your repository locally
3. Create Heroku app:
```bash
heroku create your-rust-hours-bot
```
4. Set environment variables:
```bash
heroku config:set DISCORD_TOKEN=your_token_here
heroku config:set CLIENT_ID=your_client_id_here
```
5. Deploy:
```bash
git push heroku main
```

### Option 3: DigitalOcean App Platform
1. Fork repository to GitHub
2. Visit [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
3. Create app from GitHub source
4. Configure environment variables
5. Deploy with automatic Docker detection

### Option 4: Google Cloud Run
1. Enable Cloud Run API
2. Build and push Docker image:
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT/rust-hours-bot
```
3. Deploy:
```bash
gcloud run deploy --image gcr.io/YOUR_PROJECT/rust-hours-bot --platform managed
```

### Option 5: Self-Hosted VPS
1. Copy project to your server
2. Install Node.js 18+
3. Create `.env` file with your credentials
4. Install dependencies: `npm install`
5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start index.js --name rust-hours-bot
pm2 startup
pm2 save
```

## Environment Configuration

### Required Variables
```bash
DISCORD_TOKEN=your_bot_token_from_discord_dev_portal
CLIENT_ID=your_application_id_from_discord_dev_portal
```

### Optional Variables
```bash
PORT=8080  # Port for health check server (cloud platforms often require this)
```

## Post-Deployment Steps

### 1. Verify Bot Status
- Check deployment logs for "Bot is online!" message
- Check health endpoint at `https://your-app-url.com/` shows "Rust Hours Discord Bot is running! 🦀"

### 2. Test Commands
- Invite bot to a test server using your generated invite link
- Wait up to 1 hour for global commands to propagate
- Test `/ping` command first
- Test `/hours` with a known Battlemetrics player ID

### 3. Monitor Bot
- Set up logging/monitoring on your chosen platform
- Bot includes comprehensive error handling to prevent crashes
- Health check endpoint allows platform monitoring

## Common Issues

### Commands Not Appearing
- **Solution**: Global commands take up to 1 hour to propagate
- **Quick Fix**: Kick and re-invite bot to server

### Bot Not Responding
- Check deployment logs for errors
- Verify `DISCORD_TOKEN` and `CLIENT_ID` are correct
- Ensure bot has "Send Messages" permission in channels

### API Timeouts
- Battlemetrics API can be slow (10s timeout configured)
- Bot handles this gracefully with user-friendly error messages

### Permission Errors
- Ensure bot has required permissions in servers
- Use the exact invite link with `permissions=2048`

## Scaling Considerations

For high-traffic bots:
- Consider implementing Redis caching for Battlemetrics responses
- Add rate limiting to prevent API abuse
- Monitor Battlemetrics API limits
- Consider multiple bot instances with load balancing

## Security Notes

- Never commit `.env` file to version control
- Rotate bot token if compromised
- Consider setting up Discord webhook for deployment notifications
- Monitor bot usage patterns for abuse