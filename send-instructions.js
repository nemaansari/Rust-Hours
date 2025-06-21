const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", async () => {
  console.log("Bot connected!");

  const channelId = "1385663380379009186";
  const channel = await client.channels.fetch(channelId);

  const instructionsEmbed = new EmbedBuilder()
    .setColor("#ce422b")
    .setTitle("🦀 Rust Hours Bot - Complete Guide")
    .setThumbnail("https://cdn.battlemetrics.com/b/standardicons/rust.png")
    .setDescription(
      "Follow these steps to check any Rust player's hours and stats!",
    )
    .addFields({
      name: "**Step 1: Google the Server** 🔍",
      value:
        "Search for your favorite Rust server on Google and click on the Battlemetrics link",
      inline: false,
    })
    .setImage("https://i.imgur.com/izsxoFA.png")
    .setFooter({ text: "Step 1 of 6" });

  const step2Embed = new EmbedBuilder()
    .setColor("#ce422b")
    .setTitle("**Step 2: Locate the Player** 👤")
    .setDescription("Click on any player name in the server's player list")
    .setImage("https://i.imgur.com/LqTOJMq.png")
    .setFooter({ text: "Step 2 of 6" });

  const step3Embed = new EmbedBuilder()
    .setColor("#ce422b")
    .setTitle("**Step 3: Copy the ID from URL** 📋")
    .setDescription("Copy the number from the player's profile URL")
    .addFields(
      {
        name: "Example URL:",
        value: "`https://www.battlemetrics.com/players/123456789`",
        inline: false,
      },
      {
        name: "Copy this part:",
        value: "`123456789`",
        inline: false,
      },
    )
    .setImage("https://i.imgur.com/Yi3eW1O.png")
    .setFooter({ text: "Step 3 of 6" });

  const step4Embed = new EmbedBuilder()
    .setColor("#ce422b")
    .setTitle("**Step 4: Use the Command** 🤖")
    .setDescription("Type the command in Discord with the player ID")
    .addFields(
      {
        name: "Command Format:",
        value: "`/hours playerid:123456789`",
        inline: false,
      },
      {
        name: "Example:",
        value:
          "If the URL was `battlemetrics.com/players/987654321`\nUse: `/hours playerid:987654321`",
        inline: false,
      },
    )
    .setImage("https://i.imgur.com/CkMocid.png")
    .setFooter({ text: "Step 4 of 6" });

  const step5Embed = new EmbedBuilder()
    .setColor("#ce422b")
    .setTitle("**Step 5: View Results** 📊")
    .setDescription("The bot will show you detailed player statistics!")
    .addFields({
      name: "You'll get:",
      value:
        "• Player name\n• Total hours played\n• Last seen date\n• Top 5 most-played servers\n• Link to their Battlemetrics profile",
      inline: false,
    })
    .setImage("https://i.imgur.com/M41TSMC.png")
    .setFooter({ text: "Step 5 of 6" });

  const faqEmbed = new EmbedBuilder()
    .setColor("#ce422b")
    .setTitle("**Frequently Asked Questions** ❓")
    .addFields(
      {
        name: "🤖 Bot not responding?",
        value:
          "The bot may be starting up - wait 10-15 seconds and try again. This is normal when the bot has been idle.",
        inline: false,
      },
      {
        name: '❌ "Player not found" error?',
        value:
          "• Double-check the player ID is correct\n• Make sure you copied only the numbers\n• Verify the player exists on Battlemetrics",
        inline: false,
      },
      {
        name: "⏰ Why does the bot show offline sometimes?",
        value:
          "The bot sleeps when not in use to save resources. It automatically wakes up when you use commands.",
        inline: false,
      },
      {
        name: "🔗 Invalid player ID format?",
        value:
          "Make sure you're only copying the numbers from the URL, not the entire link.",
        inline: false,
      },
      {
        name: "📱 Commands available:",
        value:
          "`/ping` - Test if bot is working\n`/hours playerid:123456789` - Get player hours",
        inline: false,
      },
      {
        name: "🆘 Still need help?",
        value: "Ask in <#1385663731454967869> and someone will help you out!",
        inline: false,
      },
    )
    .setFooter({ text: "Made with ❤️ for the Rust community | FAQ" })
    .setTimestamp();

  // Send all embeds
  await channel.send({ embeds: [instructionsEmbed] });
  await channel.send({ embeds: [step2Embed] });
  await channel.send({ embeds: [step3Embed] });
  await channel.send({ embeds: [step4Embed] });
  await channel.send({ embeds: [step5Embed] });
  await channel.send({ embeds: [faqEmbed] });

  console.log("All instruction embeds sent!");
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
