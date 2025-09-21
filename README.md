# Rust Hours Discord Bot

A Discord bot that fetches comprehensive Rust player statistics from Battlemetrics API and displays detailed playtime breakdowns by region, server rankings, and gaming statistics through Discord slash commands.

## 🚀 Add to Your Server

**[➕ Add Rust Hours Bot to Your Server](https://discord.com/oauth2/authorize?client_id=1385626383115489320&permissions=2048&scope=bot%20applications.commands)**

## Features

- 🦀 Get comprehensive Rust player hours from Battlemetrics
- 🌍 Regional playtime breakdown (US, EU, Asia, Oceania, etc.)
- 🏆 Top 5 most played servers ranking
- 🎯 Aim training server detection
- 📊 Rich Discord embeds with statistics
- ⚡ Slash command interface (`/hours`)

## How to Use

1. **Add the bot** to your Discord server using the link above
2. **Find a player's Battlemetrics ID:**
   - Go to any Rust server's Battlemetrics page
   - Search for the player name
   - Click on their profile
   - Copy the number from the URL (e.g., `battlemetrics.com/players/123456789`)
3. **Use the command:** `/hours playerid:123456789`
4. **View the stats!** The bot will show comprehensive Rust statistics

## Commands

- `/ping` - Check if the bot is online
- `/hours <playerid>` - Get comprehensive Rust player statistics

---

## For Developers

### Local Development Setup

### Local Development Setup

### 1. Create Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name your bot
3. Go to "Bot" section and create a bot
4. Copy the bot token
5. Go to "General Information" and copy the Application ID

### 2. Set Up Environment
1. Clone this repository
2. Copy `.env.example` to `.env`
3. Fill in your Discord credentials:
```bash
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
PORT=8080
```

### 3. Install and Run
```bash
npm install
node index.js
```

### 4. Invite Bot to Server
Use this URL template (replace CLIENT_ID with your Application ID):
```
https://discord.com/oauth2/authorize?client_id=CLIENT_ID&permissions=2048&scope=bot%20applications.commands
```

## Deployment Options

### Local Development
```bash
npm install
node index.js
```

### Docker Deployment
```bash
docker build -t rust-hours-bot .
docker run -d --env-file .env -p 8080:8080 rust-hours-bot
```

### Cloud Platforms
The bot includes a health check server on port 8080 and is ready for deployment on:
- Heroku
- Railway
- DigitalOcean App Platform
- Google Cloud Run
- AWS ECS/Fargate

## Usage

1. Invite the bot to your Discord server
2. Find a player's Battlemetrics ID from their profile URL
3. Use `/hours playerid:123456789` in any channel
4. View comprehensive statistics including:
   - Total playtime hours
   - Regional breakdown
   - Top 5 most played servers
   - Direct link to Battlemetrics profile

## Commands

- `/ping` - Health check command
- `/hours <playerid>` - Get comprehensive Rust player statistics

## Development

### Code Formatting
```bash
npm run format
```

### Environment Variables
- `DISCORD_TOKEN` - Your Discord bot token (required)
- `CLIENT_ID` - Your Discord application ID (required)  
- `PORT` - Server port for health checks (optional, defaults to 8080)

Note: Global commands may take up to 1 hour to appear in all Discord servers after deployment.
