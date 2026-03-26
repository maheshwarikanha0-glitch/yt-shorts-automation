import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Generations table: Stores all AI-generated content for shorts
 */
export const generations = mysqlTable("generations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  topic: text("topic").notNull(),
  tone: varchar("tone", { length: 50 }).notNull(), // Motivational, Educational, Storytelling
  duration: varchar("duration", { length: 10 }).notNull(), // 30s, 60s
  hook: text("hook"),
  script: text("script"),
  title: text("title"),
  hashtags: text("hashtags"), // JSON array stored as string
  scenes: text("scenes"), // JSON array stored as string
  imagePrompts: text("imagePrompts"), // JSON array stored as string
  voiceType: varchar("voiceType", { length: 50 }), // male, female
  voiceAccent: varchar("voiceAccent", { length: 50 }), // American, British, etc.
  voiceTone: varchar("voiceTone", { length: 50 }), // neutral, energetic, calm, etc.
  voiceOverUrl: text("voiceOverUrl"), // URL to generated voice-over
  videoUrl: text("videoUrl"), // URL to generated video
  status: mysqlEnum("status", ["draft", "generating", "ready", "published", "failed"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = typeof generations.$inferInsert;

/**
 * History table: Stores conversation history for sidebar
 */
export const history = mysqlTable("history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  generationId: int("generationId").references(() => generations.id),
  title: text("title").notNull(), // Short title for history item
  topic: text("topic"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type History = typeof history.$inferSelect;
export type InsertHistory = typeof history.$inferInsert;

/**
 * Scheduled shorts table: Stores scheduled publications
 */
export const scheduledShorts = mysqlTable("scheduledShorts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  generationId: int("generationId").notNull().references(() => generations.id),
  scheduledTime: timestamp("scheduledTime").notNull(),
  youtubeVideoId: varchar("youtubeVideoId", { length: 255 }),
  status: mysqlEnum("status", ["scheduled", "published", "failed"]).default("scheduled"),
  publishedAt: timestamp("publishedAt"),
  analyticsViews: int("analyticsViews").default(0),
  analyticsLikes: int("analyticsLikes").default(0),
  analyticsComments: int("analyticsComments").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledShort = typeof scheduledShorts.$inferSelect;
export type InsertScheduledShort = typeof scheduledShorts.$inferInsert;

/**
 * Voice settings table: User preferences for voice-over generation
 */
export const voiceSettings = mysqlTable("voiceSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  defaultVoiceType: varchar("defaultVoiceType", { length: 50 }).default("female"),
  defaultVoiceAccent: varchar("defaultVoiceAccent", { length: 50 }).default("American"),
  defaultVoiceTone: varchar("defaultVoiceTone", { length: 50 }).default("energetic"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VoiceSetting = typeof voiceSettings.$inferSelect;
export type InsertVoiceSetting = typeof voiceSettings.$inferInsert;