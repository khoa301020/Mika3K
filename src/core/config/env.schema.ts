import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Bot
  BOT_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
  BOT_PREFIX: Joi.string().default('!'),
  BOT_TOKEN: Joi.string().required(),
  CLIENT_ID: Joi.string().required(),
  OWNER_ID: Joi.string().required(),
  LOG_CHANNEL_ID: Joi.string().required(),

  // MongoDB
  MONGO_URI: Joi.string().required(),
  MONGO_URI_BA: Joi.string().required(),

  // MAL
  MAL_CLIENT_ID: Joi.string().required(),

  // SauceNAO
  SAUCENAO_API_KEY: Joi.string().required(),

  // Currency
  CURRENCY_CONVERTER_API_KEY: Joi.string().required(),

  // NHentai
  NHENTAI_ORIGIN_API: Joi.string().optional(),
  NHENTAI_USE_ORIGIN: Joi.string().default('false'),
  NHENTAI_COOKIE: Joi.string().optional(),
  NHENTAI_USER_AGENT: Joi.string().optional(),
  NHENTAI_MAX_ID: Joi.number().optional(),
  FLARESOLVERR_ENDPOINT: Joi.string().optional(),

  // System
  SYSTEM_SECRET_TOKEN: Joi.string().optional().default(''),

  // API
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().optional().default(''),
  DISCORD_CLIENT_SECRET: Joi.string().optional().default(''),
  DISCORD_CALLBACK_URL: Joi.string()
    .optional()
    .default('http://localhost:3000/api/auth/discord/callback'),
});
