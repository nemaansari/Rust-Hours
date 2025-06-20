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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const BATTLEMETRICS_API = "https://api.battlemetrics.com";

async function getPlayerHours(playerId) {
  try {
    const playerResponse = await axios.get(
      `${BATTLEMETRICS_API}/players/${playerId}`,
    );
    const playerData = playerResponse.data.data;

    const sessionsResponse = await axios.get(
      `${BATTLEMETRICS_API}/players/${playerId}/relationships/sessions`,
      {
        params: {
          include: "server",
          "page[size]": 100,
        },
      },
    );

    let totalMinutes = 0;
    const serverHours = {};
    const sessions = sessionsResponse.data.data;
    const servers = sessionsResponse.data.included || [];

    const serverMap = {};
    servers.forEach((server) => {
      if (server.type === `server`) {
        serverMap[server.id] = server.attributes.name;
      }
    });

    sessions.forEach((session) => {
      if (session.attributes.start && session.attributes.stop) {
        const start = new Date(session.attributes.start);
        const stop = new Date(session.attributes.stop);
        const duration = (stop - start) / (1000 * 60);
        totalMinutes += duration;

        const serverId = session.relationships?.server?.data?.id;
        if (serverId) {
          if (!serverHours[serverId]) {
            serverHours[serverId] = 0;
          }
          serverHours[serverId] += duration;
        }
      }
    });

    const topServers = Object.entries(serverHours)
      .map(([serverId, minutes]) => ({
        serverId,
        name: serverMap[serverId] || `Server ${serverId}`,
        hours: Math.round((minutes / 60) * 100) / 100,
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

    return {
      name: playerData.attributes.name,
      totalHours: totalHours,
      lastSeen: playerData.attributes.lastSeen,
      playerId: playerId,
      topServers: topServers,
    };
  } catch (error) {
    console.error("Battlemetrics API Error:", error.message);
    return null;
  }
}

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),

  new SlashCommandBuilder()
    .setName("hours")
    .setDescription("Get a player's Rust hours from Battlemetrics")
    .addStringOption((option) =>
      option
        .setName("playerid")
        .setDescription(
          "The player ID from Battlemetrics URL (e.g., 123456789)",
        )
        .setRequired(true),
    ),
];

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

client.once("ready", () => {
  console.log(`Bot is online! Logged in as ${client.user.tag}`);
  registerCommands();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }

  if (interaction.commandName === "hours") {
    await interaction.deferReply();

    const playerId = interaction.options.getString("playerid");

    if (!/^\d+$/.test(playerId)) {
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

      return await interaction.editReply({ embeds: [errorEmbed] });
    }

    try {
      const playerData = await getPlayerHours(playerId);

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

        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      let topServersText = ` `;
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

      const embed = new EmbedBuilder()
        .setColor("#ce422b")
        .setTitle("🦀 Rust Player Hours")
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
            name: "📅 Last Seen",
            value: playerData.lastSeen
              ? new Date(playerData.lastSeen).toLocaleString()
              : "Unknown",
            inline: true,
          },
          {
            name: "🏆 Top 5 Servers",
            value: topServersText,
            inline: false,
          },
          {
            name: "🔗 Battlemetrics Profile",
            value: `[View Profile](https://www.battlemetrics.com/players/${playerId})`,
            inline: false,
          },
        )
        .setFooter({ text: "Data from Battlemetrics API" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error processing hours command:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("❌ Error")
        .setDescription(
          "Something went wrong while fetching player data. Please try again later.",
        );

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
