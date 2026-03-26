import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import {
  getUserGenerations,
  getGenerationById,
  createGeneration,
  updateGeneration,
  getUserHistory,
  addToHistory,
  getOrCreateVoiceSettings,
  updateVoiceSettings,
  getUserScheduledShorts,
  createScheduledShort,
  updateScheduledShortStatus,
} from "./db";

/**
 * Free stock resources recommendations
 */
const FREE_STOCK_RESOURCES = {
  video: [
    { name: "Pexels Videos", url: "https://www.pexels.com/videos", description: "Free stock videos" },
    { name: "Pixabay Videos", url: "https://pixabay.com/videos", description: "Free HD videos" },
    { name: "Unsplash Videos", url: "https://unsplash.com/napi/videos", description: "Free short clips" },
  ],
  image: [
    { name: "Pexels", url: "https://www.pexels.com", description: "Free stock photos" },
    { name: "Pixabay", url: "https://pixabay.com", description: "Free images and illustrations" },
    { name: "Unsplash", url: "https://unsplash.com", description: "Free high-quality photos" },
  ],
  music: [
    { name: "Pixabay Music", url: "https://pixabay.com/music", description: "Free royalty-free music" },
    { name: "Pexels Music", url: "https://www.pexels.com/search/music", description: "Free background music" },
    { name: "YouTube Audio Library", url: "https://www.youtube.com/audiolibrary", description: "Free music for YouTube" },
  ],
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * AI Content Generation Router
   */
  generation: router({
    /**
     * Generate AI content (hook, script, scenes, prompts, title, hashtags)
     */
    generate: protectedProcedure
      .input(
        z.object({
          topic: z.string().min(3, "Topic must be at least 3 characters"),
          tone: z.enum(["Motivational", "Educational", "Storytelling"]),
          duration: z.enum(["30s", "60s"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const systemPrompt = `You are a viral YouTube Shorts producer and content strategist. Generate a complete content package for a YouTube Short.
        
Output ONLY valid JSON with this exact structure:
{
  "hook": "A single compelling opening line (max 10 words) that grabs attention immediately",
  "script": "Full 30-60 second script with natural pauses and emphasis markers",
  "scenes": [
    {"time": "0:00-0:05", "visual": "Description of what should be shown"},
    {"time": "0:05-0:15", "visual": "Next scene description"}
  ],
  "imagePrompts": [
    "Detailed prompt for AI image generation or stock footage search",
    "Another prompt for different scene"
  ],
  "title": "SEO-optimized YouTube title (max 60 chars)",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: `Create a ${input.duration} YouTube Short about: "${input.topic}"\nTone: ${input.tone}\nDuration: ${input.duration}`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "youtube_short_content",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    hook: { type: "string" },
                    script: { type: "string" },
                    scenes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          time: { type: "string" },
                          visual: { type: "string" },
                        },
                        required: ["time", "visual"],
                      },
                    },
                    imagePrompts: { type: "array", items: { type: "string" } },
                    title: { type: "string" },
                    hashtags: { type: "array", items: { type: "string" } },
                  },
                  required: ["hook", "script", "scenes", "imagePrompts", "title", "hashtags"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices?.[0]?.message?.content;
          if (!content) throw new Error("No content generated");

          const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));

          // Create generation record
          const result = await createGeneration({
            userId: ctx.user.id,
            topic: input.topic,
            tone: input.tone,
            duration: input.duration,
            hook: parsed.hook,
            script: parsed.script,
            scenes: JSON.stringify(parsed.scenes),
            imagePrompts: JSON.stringify(parsed.imagePrompts),
            title: parsed.title,
            hashtags: JSON.stringify(parsed.hashtags),
            status: "draft",
          });

          // Add to history
          await addToHistory({
            userId: ctx.user.id,
            title: parsed.title || input.topic,
            topic: input.topic,
          });

          return {
            ...parsed,
            scenes: parsed.scenes,
            imagePrompts: parsed.imagePrompts,
            hashtags: parsed.hashtags,
          };
        } catch (error) {
          console.error("Generation error:", error);
          throw new Error("Failed to generate content. Please try again.");
        }
      }),

    /**
     * Get all generations for current user
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      const gens = await getUserGenerations(ctx.user.id);
      return gens.map((g) => ({
        ...g,
        scenes: g.scenes ? JSON.parse(g.scenes) : [],
        imagePrompts: g.imagePrompts ? JSON.parse(g.imagePrompts) : [],
        hashtags: g.hashtags ? JSON.parse(g.hashtags) : [],
      }));
    }),

    /**
     * Get a specific generation
     */
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
      const gen = await getGenerationById(input.id);
      if (!gen || gen.userId !== ctx.user.id) {
        throw new Error("Generation not found");
      }
      return {
        ...gen,
        scenes: gen.scenes ? JSON.parse(gen.scenes) : [],
        imagePrompts: gen.imagePrompts ? JSON.parse(gen.imagePrompts) : [],
        hashtags: gen.hashtags ? JSON.parse(gen.hashtags) : [],
      };
    }),

    /**
     * Get free stock resources for a generation
     */
    getStockResources: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
      const gen = await getGenerationById(input.id);
      if (!gen || gen.userId !== ctx.user.id) {
        throw new Error("Generation not found");
      }

      return {
        videoResources: FREE_STOCK_RESOURCES.video,
        imageResources: FREE_STOCK_RESOURCES.image,
        musicResources: FREE_STOCK_RESOURCES.music,
      };
    }),
  }),

  /**
   * Voice Settings Router
   */
  voiceSettings: router({
    /**
     * Get or create voice settings for current user
     */
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getOrCreateVoiceSettings(ctx.user.id);
    }),

    /**
     * Update voice settings
     */
    update: protectedProcedure
      .input(
        z.object({
          defaultVoiceType: z.enum(["male", "female"]).optional(),
          defaultVoiceAccent: z.string().optional(),
          defaultVoiceTone: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await updateVoiceSettings(ctx.user.id, input);
        return await getOrCreateVoiceSettings(ctx.user.id);
      }),
  }),

  /**
   * History Router
   */
  history: router({
    /**
     * Get conversation history
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserHistory(ctx.user.id);
    }),
  }),

  /**
   * Scheduling Router
   */
  scheduling: router({
    /**
     * Get scheduled shorts
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserScheduledShorts(ctx.user.id);
    }),

    /**
     * Schedule a short for publishing
     */
    schedule: protectedProcedure
      .input(
        z.object({
          generationId: z.number(),
          scheduledTime: z.date(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const gen = await getGenerationById(input.generationId);
        if (!gen || gen.userId !== ctx.user.id) {
          throw new Error("Generation not found");
        }

        await createScheduledShort({
          userId: ctx.user.id,
          generationId: input.generationId,
          scheduledTime: input.scheduledTime,
          status: "scheduled",
        });

        return { success: true };
      }),

    /**
     * Update scheduled short status
     */
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["scheduled", "published", "failed"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verify ownership
        const scheduled = await getUserScheduledShorts(ctx.user.id);
        if (!scheduled.find((s) => s.id === input.id)) {
          throw new Error("Scheduled short not found");
        }

        await updateScheduledShortStatus(input.id, input.status, new Date());
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
