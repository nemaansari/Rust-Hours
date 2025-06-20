const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
require('dotenv').config();

import { Client } from `discord.js`;
import { GatewayIntentBits } from "discord.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const commands = [
    new SlashCommandBuilder()
    .setName(`ping`)
    .setDescription(`Replies with pong`),

    new SlashCommandBuilder()
    .setName(`hours`)
    .setDescription(`Get a player's Rust hours`)
    .addStringOption(option =>
        option.setName(`playerid`)
        .setDescription(`The player ID from Battlemetrics URL (e.g., 123456789)`)
        .setRequired(true)
    ),

];


async function registerCommands() {
    const rest = new REST({ version: `10` }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(`Started refreshing application (/) commands.`);

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log(`Successfully reloaded application (/) commands.`);
    } catch (error) {
        console.error(`Error registering commands:`, error);
    }
}

client.once(`ready`, () => {
    console.log(`Bot is online! Logged in as ${client.user.tag}`);
});

client.on(`interactionCreate`, async interaction => {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === `ping`) {
        await interaction.reply (`pong!`);
    }

    if (interaction.commandName === `hours`) {
        const playerId = interaction.options.getString(`playerid`);
        await interaction.reply(`Looking up hours for player ID: ${playerId}`);
    }

});

client.on(`messageCreate`, message => {

    if (message.author.bot) return;

    if(message.content === `!ping`) {
        message.reply(`pong! (new slash command)`);
    }
});

client.login(process.env.DISCORD_TOKEN);