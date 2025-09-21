# Rust Hours Discord Bot - AI Assistant Instructions

## Project Overview
This is a Discord bot that fetches comprehensive Rust player statistics from the Battlemetrics API. It provides detailed playtime breakdowns by region, server rankings, and gaming statistics through Discord slash commands.

## Architecture & Key Components

### Core Files
- **`index.js`** - Main bot logic with Discord.js client, Battlemetrics API integration, and slash command handlers
- **`send-instructions.js`** - Utility script for sending instructional embeds to Discord channels
- **`package.json`** - Node.js dependencies: discord.js v14, axios, express, dotenv
- **`Dockerfile`** - Alpine-based container for cloud deployment with health check server

### API Integration Pattern
The bot uses a sophisticated server metadata approach to fetch playtime data:
```javascript
// Key pattern: Include server data in player API call
const response = await axios.get(`${BATTLEMETRICS_API}/players/${playerId}`, {
  params: { include: "server" },
  timeout: 10000,
});
```

### Regional Classification System
The `getPlayerHours()` function implements extensive regex-based server classification:
- **US/NA**: `/\b(US|USA|America|NA|West|East|Central|North America)\b/i`
- **EU**: `/\b(EU|Europe|UK|Germany|France|Netherlands|London|Amsterdam|Sweden|Norway|Denmark)\b/i`
- **Asia/APAC**: `/\b(Asia|APAC|Japan|Singapore|Korea|China|Hong Kong|SEA|Southeast Asia)\b/i`
- Plus Canada, Mexico, Russia/CIS, Middle East, Africa, South America
- **Aim Training**: `/\b(aim|training|train|combat|arena|dm|deathmatch|practice|warmup)\b/i`

## Discord Integration Patterns

### Interaction Safety Pattern
Always use `safeInteractionReply()` to handle Discord's 3-second interaction timeout:
```javascript
async function safeInteractionReply(interaction, content) {
  try {
    if (interaction.replied || interaction.deferred) {
      return await interaction.editReply(content);
    } else {
      return await interaction.reply(content);
    }
  } catch (error) {
    if (error.code === 10062) { // Handle expired interactions gracefully
      console.log("Interaction expired - user will need to run command again");
      return null;
    }
    throw error;
  }
}
```

### Command Registration
Commands are registered per-guild for faster development updates:
```javascript
await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
```

### Rich Embed Structure
- **Color**: `#ce422b` (Rust orange theme)
- **Thumbnail**: Rust game icon from Battlemetrics CDN
- **Dynamic Fields**: Only show regions/categories with >0 hours
- **Top 5 Servers**: Sorted by playtime descending
- **Inline Layout**: 3-column grid for regional stats

## Development Workflows

### Environment Setup
Required `.env` variables:
```bash
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_test_guild_id
PORT=8080  # Optional, defaults to 8080
```

### Local Development
```bash
npm install
node index.js  # Bot starts with health check server on port 8080
```

### Code Style
- Uses Prettier for formatting: `npm run format`
- Extensive console logging for debugging API calls
- Error boundaries to prevent bot crashes

### Deployment
- **Docker**: Multi-stage build with production dependencies only
- **Health Check**: Express server on `/` endpoint responds "Rust Hours Discord Bot is running! 🦀"
- **Cloud Ready**: Uses `PORT` environment variable, handles container signals

## Error Handling Patterns

### Comprehensive Error Recovery
```javascript
// Global handlers prevent crashes
process.on("unhandledRejection", (reason, promise) => { /* log but continue */ });
process.on("uncaughtException", (error) => { /* log but continue */ });
client.on("error", (error) => { /* log Discord errors */ });
```

### User-Friendly Error Messages
- **Invalid Player ID**: Numeric validation with format examples
- **Player Not Found**: Clear troubleshooting tips
- **API Errors**: Generic fallback message, detailed server logs

## Data Processing Logic

### Time Calculations
All playtime uses precise 2-decimal rounding: `Math.round((seconds / 3600) * 100) / 100`

### Server Ranking
Top servers determined by raw playtime, formatted for embed display with emoji indicators.

## Extension Points

When adding features:
- Follow the regional classification pattern for new server types
- Use `safeInteractionReply()` for all Discord responses  
- Add comprehensive logging with clear start/end markers
- Maintain the inline embed field structure for UI consistency
- Test with expired interactions (wait >3 seconds before responding)