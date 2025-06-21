const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
} = require("discord.js");
const axios = require("axios");
require("dotenv").config();

// Initialize Discord client with minimal required intents
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const BATTLEMETRICS_API = "https://api.battlemetrics.com";

/**
 * Fetches comprehensive Rust player statistics from Battlemetrics API
 * Uses server meta data approach to get playtime information
 * @param {string} playerId - Battlemetrics player ID
 * @returns {Object|null} Player data object or null if error/not found
 */
async function getPlayerHours(playerId) {
  try {
    console.log(`Fetching player data for ID: ${playerId}`);

    // Fetch player data with server information included
    // This gives us both basic player info and server playtime data
    const response = await axios.get(
      `${BATTLEMETRICS_API}/players/${playerId}`,
      {
        params: { include: "server" },
        timeout: 10000,
      },
    );

    const playerData = response.data.data;
    const serverData = response.data.included || [];

    console.log(`Found ${serverData.length} servers with playtime data`);

    // Initialize tracking variables
    let totalSeconds = 0;
    const serverHours = {};
    let usSeconds = 0;
    let euSeconds = 0;
    let aimTrainingSeconds = 0;

    // Process each server to calculate playtime statistics
    serverData.forEach((server) => {
      if (server.type === "server" && server.meta && server.meta.timePlayed) {
        const serverName = server.attributes.name;
        const timePlayed = server.meta.timePlayed; // Time in seconds

        console.log(`${serverName}: ${(timePlayed / 3600).toFixed(2)} hours`);

        // Add to total playtime
        totalSeconds += timePlayed;

        // Store individual server data
        serverHours[server.id] = {
          name: serverName,
          seconds: timePlayed,
          hours: Math.round((timePlayed / 3600) * 100) / 100,
        };

        // Classify servers by region (US servers)
        if (serverName.match(/\b(US|USA|America|NA|West|East|Central)\b/i)) {
          usSeconds += timePlayed;
        }
        // Classify servers by region (EU servers)
        else if (
          serverName.match(
            /\b(EU|Europe|UK|Germany|France|Netherlands|London|Amsterdam)\b/i,
          )
        ) {
          euSeconds += timePlayed;
        }

        // Classify aim training/practice servers
        if (
          serverName.match(
            /\b(aim|training|train|combat|arena|dm|deathmatch|practice|warmup)\b/i,
          )
        ) {
          aimTrainingSeconds += timePlayed;
        }
      }
    });

    // Convert all time values from seconds to hours with 2 decimal precision
    const totalHours = Math.round((totalSeconds / 3600) * 100) / 100;
    const usHours = Math.round((usSeconds / 3600) * 100) / 100;
    const euHours = Math.round((euSeconds / 3600) * 100) / 100;
    const aimTrainingHours =
      Math.round((aimTrainingSeconds / 3600) * 100) / 100;

    // Create top 5 most played servers list
    const topServers = Object.entries(serverHours)
      .map(([serverId, data]) => ({
        serverId,
        name: data.name,
        hours: data.hours,
      }))
      .sort((a, b) => b.hours - a.hours) // Sort by hours descending
      .slice(0, 5); // Take top 5

    console.log(`Total hours calculated: ${totalHours}`);

    return {
      name: playerData.attributes.name,
      totalHours: totalHours,
      playerId: playerId,
      topServers: topServers,
      usHours: usHours,
      euHours: euHours,
      aimTrainingHours: aimTrainingHours,
    };
  } catch (error) {
    console.error("Battlemetrics API Error:", error.message);
    if (error.response) {
      console.error("API Response Status:", error.response.status);
      console.error("API Response Data:", error.response.data);
    }
    return null;
  }
}

// Define slash commands for the bot
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong! - Health check command"),

  new SlashCommandBuilder()
    .setName("hours")
    .setDescription(
      "Get comprehensive Rust player statistics from Battlemetrics",
    )
    .addStringOption((option) =>
      option
        .setName("playerid")
        .setDescription(
          "Battlemetrics player ID (found in player's Battlemetrics URL)",
        )
        .setRequired(true),
    ),
];

/**
 * Registers slash commands with Discord API
 * Commands are registered per guild for faster updates during development
 */
async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      ),
      { body: commands },
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}

// Bot ready event - fires when bot successfully connects to Discord
client.once("ready", () => {
  console.log(`Bot is online! Logged in as ${client.user.tag}`);
  registerCommands();
});

/**
 * Safely handles Discord interaction replies to prevent crashes from expired interactions
 * Discord interactions expire after 3 seconds, this handles those cases gracefully
 * @param {Interaction} interaction - Discord interaction object
 * @param {string|Object} content - Reply content (string or embed object)
 * @returns {Promise<Message|null>} Reply message or null if interaction expired
 */
async function safeInteractionReply(interaction, content) {
  try {
    if (interaction.replied || interaction.deferred) {
      return await interaction.editReply(content);
    } else {
      return await interaction.reply(content);
    }
  } catch (error) {
    // Handle "Unknown interaction" errors gracefully (code 10062)
    if (error.code === 10062) {
      console.log("Interaction expired - user will need to run command again");
      return null;
    }
    throw error; // Re-throw other errors
  }
}

// Main interaction handler for slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Handle ping command - simple health check
  if (interaction.commandName === "ping") {
    try {
      await safeInteractionReply(interaction, "Pong! 🏓");
    } catch (error) {
      console.error("Error responding to ping:", error.message);
    }
  }
  // Handle hours command - main functionality
  else if (interaction.commandName === "hours") {
    console.log("=== HOURS COMMAND STARTED ===");

    try {
      // Send immediate response to prevent Discord 3-second timeout
      const initialReply = await safeInteractionReply(
        interaction,
        "🔄 Looking up player data... this may take a moment!",
      );

      if (!initialReply) {
        console.log("Initial reply failed - interaction expired");
        return;
      }

      console.log("Initial reply sent successfully");

      const playerId = interaction.options.getString("playerid");
      console.log(`Player ID received: ${playerId}`);

      // Validate player ID format (must be numeric)
      if (!/^\d+$/.test(playerId)) {
        console.log("Invalid player ID format");
        const errorEmbed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("❌ Invalid Player ID")
          .setDescription(
            "Please provide a valid numeric player ID from the Battlemetrics URL.",
          )
          .addFields({
            name: "Example",
            value:
              "From URL: `https://www.battlemetrics.com/players/123456789`\nUse: `/hours playerid:123456789`",
          });

        await safeInteractionReply(interaction, {
          content: "",
          embeds: [errorEmbed],
        });
        console.log("=== HOURS COMMAND COMPLETED (INVALID ID) ===");
        return;
      }

      // Fetch player data from Battlemetrics API
      console.log("About to call getPlayerHours...");
      const playerData = await getPlayerHours(playerId);
      console.log(
        "getPlayerHours completed, result:",
        playerData ? "success" : "null",
      );

      // Handle case where player is not found or API error occurred
      if (!playerData) {
        const errorEmbed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("❌ Player Not Found")
          .setDescription(`Could not find player with ID: ${playerId}`)
          .addFields({
            name: "Tips",
            value:
              "• Make sure the player ID is correct\n• Check that the player exists on Battlemetrics\n• Try again in a few moments",
          });

        await safeInteractionReply(interaction, {
          content: "",
          embeds: [errorEmbed],
        });
        console.log("=== HOURS COMMAND COMPLETED (PLAYER NOT FOUND) ===");
        return;
      }

      // Format top servers list for display
      let topServersText = "";
      if (playerData.topServers && playerData.topServers.length > 0) {
        topServersText = playerData.topServers
          .map(
            (server, index) =>
              `${index + 1}. **${server.name}** - ${server.hours}h`,
          )
          .join("\n");
      } else {
        topServersText = "No server data available";
      }

      // Create rich embed with all player statistics
      console.log("Building embed...");
      const embed = new EmbedBuilder()
        .setColor("#ce422b") // Rust orange color
        .setTitle("🦀 Rust Player Statistics")
        .setThumbnail("https://cdn.battlemetrics.com/b/standardicons/rust.png")
        .addFields(
          {
            name: "👤 Player Name",
            value: playerData.name || "Unknown",
            inline: true,
          },
          {
            name: "⏰ Total Hours",
            value: `${playerData.totalHours} hours`,
            inline: true,
          },
          {
            name: "\u200B", // Invisible character for spacing
            value: "\u200B",
            inline: true,
          },
          {
            name: "🇺🇸 US Servers",
            value: `${playerData.usHours || 0}h`,
            inline: true,
          },
          {
            name: "🇪🇺 EU Servers",
            value: `${playerData.euHours || 0}h`,
            inline: true,
          },
          {
            name: "🎯 Aim Training",
            value: `${playerData.aimTrainingHours || 0}h`,
            inline: true,
          },
          {
            name: "🏆 Top 5 Servers",
            value: topServersText,
            inline: false,
          },
          {
            name: "🔗 Battlemetrics Profile",
            value: `[View Full Profile](https://www.battlemetrics.com/players/${playerId})`,
            inline: false,
          },
        )
        .setFooter({ text: "Data provided by Battlemetrics API" })
        .setTimestamp();

      // Send final response with player statistics
      console.log("Sending final reply...");
      await safeInteractionReply(interaction, { content: "", embeds: [embed] });
      console.log("=== HOURS COMMAND COMPLETED SUCCESSFULLY ===");
    } catch (error) {
      console.error("=== ERROR IN HOURS COMMAND ===");
      console.error("Error details:", error);

      // Send user-friendly error message
      try {
        const errorEmbed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("❌ Error")
          .setDescription(
            "Something went wrong while fetching player data. Please try again later.",
          );

        await safeInteractionReply(interaction, {
          content: "",
          embeds: [errorEmbed],
        });
        console.log("Error message sent to user");
      } catch (replyError) {
        console.error("Failed to send error message:", replyError);
      }
      console.log("=== HOURS COMMAND COMPLETED WITH ERROR ===");
    }
  }
});

// Global error handlers to prevent bot crashes
process.on("unhandledRejection", (reason, promise) => {
  console.error("=== UNHANDLED PROMISE REJECTION ===");
  console.error("Reason:", reason);
  // Don't exit process - keep bot running
});

process.on("uncaughtException", (error) => {
  console.error("=== UNCAUGHT EXCEPTION ===");
  console.error("Error:", error);
  // Don't exit process - keep bot running
});

client.on("error", (error) => {
  console.error("=== DISCORD CLIENT ERROR ===");
  console.error("Error:", error);
  // Log error but don't crash
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

// Health check server for cloud deployment platforms
const PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Rust Hours Discord Bot is running! 🦀");
});

app.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});
