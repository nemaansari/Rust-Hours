import dotenv from `dotenv`
dotenv.config()

import { Client } from `discord.js`;
import { GatewayIntentBits } from "discord.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once(`ready`, () => {
    console.log(`Bot is online! Logged in as ${client.user.tag}`);
});

client.on(`messageCreate`, message => {

    if (message.author.bot) return;

    if(message.content === `!ping`) {
        message.reply(`pong`);
    }
});

client.login(process.env.DISCORD_TOKEN);