import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, generations, history, voiceSettings, scheduledShorts, InsertGeneration, InsertHistory, InsertVoiceSetting, InsertScheduledShort } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all generations for a user
 */
export async function getUserGenerations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(generations).where(eq(generations.userId, userId)).orderBy((t) => desc(t.createdAt));
}

/**
 * Get a single generation by ID
 */
export async function getGenerationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(generations).where(eq(generations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new generation
 */
export async function createGeneration(data: InsertGeneration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(generations).values(data);
}

/**
 * Update a generation
 */
export async function updateGeneration(id: number, data: Partial<InsertGeneration>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(generations).set(data).where(eq(generations.id, id));
}

/**
 * Get user's conversation history
 */
export async function getUserHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(history).where(eq(history.userId, userId)).orderBy((t) => desc(t.createdAt));
}

/**
 * Add to conversation history
 */
export async function addToHistory(data: InsertHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(history).values(data);
}

/**
 * Get or create voice settings for user
 */
export async function getOrCreateVoiceSettings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(voiceSettings).where(eq(voiceSettings.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];
  
  const newSettings = {
    userId,
    defaultVoiceType: "female",
    defaultVoiceAccent: "American",
    defaultVoiceTone: "energetic",
  };
  await db.insert(voiceSettings).values(newSettings);
  return newSettings;
}

/**
 * Update voice settings
 */
export async function updateVoiceSettings(userId: number, data: Partial<InsertVoiceSetting>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(voiceSettings).set(data).where(eq(voiceSettings.userId, userId));
}

/**
 * Get scheduled shorts for user
 */
export async function getUserScheduledShorts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scheduledShorts).where(eq(scheduledShorts.userId, userId)).orderBy((t) => desc(t.scheduledTime));
}

/**
 * Create a scheduled short
 */
export async function createScheduledShort(data: InsertScheduledShort) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(scheduledShorts).values(data);
}

/**
 * Update scheduled short status
 */
export async function updateScheduledShortStatus(id: number, status: "scheduled" | "published" | "failed", publishedAt?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (publishedAt) updateData.publishedAt = publishedAt;
  await db.update(scheduledShorts).set(updateData).where(eq(scheduledShorts.id, id));
}
