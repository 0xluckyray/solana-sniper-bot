import TelegramBot from "node-telegram-bot-api";
import { connectDatabase } from "./config/db";
import { createUser, hasUser } from "./service/userService";
import fs from "fs";

import dotenv from "dotenv";

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const BotMenu = [
  {
    command: "start",
    description: "💥 Start",
  },
  {
    command: "setting",
    description: "⚙️ setting",
  },
  {
    command: "position",
    description: "💰 Position",
  },
  {
    command: "referral",
    description: "📊 Referral Stats",
  },
  { command: "help", description: "❓ Help" },
];

// Start Inline Keyboard
const IK_START = [
  [
    {
      text: "📥 Buy",
      callback_data: "BUY",
    },
    {
      text: "📤 Sell",
      callback_data: "SELL",
    },
  ],
  [
    {
      text: "⚙ Settings",
      callback_data: "SETTINGS",
    },
  ],
  [
    {
      text: "🔎 Snipe",
      callback_data: "SNIPE",
    },
  ],
];

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN!, {
  polling: true,
  webHook: false,
  onlyFirstMatch: true,
  filepath: false,
});

const startBot = () => {
  // Connect Database
  connectDatabase();

  bot.setMyCommands(BotMenu);

  bot.onText(/^\/start$/, async (msg: TelegramBot.Message) => {
    console.log("🚀 input start cmd:");

    const chatId = msg.chat.id;
    let user;
    const existingUser = await hasUser(chatId);
    if (existingUser) {
      console.log("User already exist: ", chatId);
      user = existingUser;
    }
    else {
      console.log("New User: ", chatId);

      const userChat = msg.chat;
      user = await createUser({
        userid: userChat.id,
        username: userChat.username,
        first_name: userChat.first_name,
        last_name: userChat.last_name
      });
    }

    const image = fs.createReadStream("./public/sniper.jpg");
    const caption = `Welcome to <b>Lucky Sniper</b> Bot!✨\n⬇You can deposit SOL to your wallet and start sniping!🔍\n\n💰Your Wallet:\n<code>${user.public_key}</code>`;
    await bot.sendPhoto(msg.chat.id, image, {
      parse_mode: "HTML",
      caption: caption,
      reply_markup: {
        inline_keyboard: IK_START,
      },
    });
  });
};

startBot();
