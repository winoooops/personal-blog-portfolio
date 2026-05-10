import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    tag: z.enum(['Essay', 'Notes', 'Build', 'Tools', 'Process']),
    lang: z.enum(['en', 'zh']).default('en'),
    date: z.coerce.date(),
    readMin: z.number(),
    featured: z.boolean().default(false),
    dek: z.string(),
    draft: z.boolean().default(false),
    source: z.enum(['local', 'obsidian']).default('local'),
    obsidianPath: z.string().optional(),
  }),
});

export const collections = { posts };
