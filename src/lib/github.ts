import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const GITHUB_URL_RE =
  /^https?:\/\/github\.com\/([^/]+)\/([^/?#]+?)(?:\.git)?\/?(?:[?#].*)?$/;

export type RepoRef = { owner: string; repo: string };

export function parseGitHubUrl(url: string | undefined): RepoRef | null {
  if (!url) return null;
  const match = url.match(GITHUB_URL_RE);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

export type RepoStats = {
  stars: number;
  lastCommit: string;
  language: string | null;
};

type CacheEntry = { stats: RepoStats; fetchedAt: number };
type CacheFile = Record<string, CacheEntry>;

const CACHE_PATH = resolve(process.cwd(), '.cache/github.json');
const CACHE_TTL_MS = 60 * 60 * 1000;

async function readCache(): Promise<CacheFile> {
  let raw: string;
  try {
    raw = await readFile(CACHE_PATH, 'utf-8');
  } catch {
    return {};
  }
  try {
    return JSON.parse(raw) as CacheFile;
  } catch {
    console.warn('[github] cache file is corrupt JSON, starting fresh');
    return {};
  }
}

async function writeCache(data: CacheFile): Promise<void> {
  try {
    await mkdir(dirname(CACHE_PATH), { recursive: true });
    await writeFile(CACHE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn('[github] could not write cache:', err);
  }
}

function cacheKey(ref: RepoRef): string {
  return `${ref.owner}/${ref.repo}`;
}

function isFresh(entry: CacheEntry | undefined): entry is CacheEntry {
  return !!entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

type GitHubRepoResponse = {
  stargazers_count: number;
  pushed_at: string;
  language: string | null;
};

export async function fetchRepoStats(
  ref: RepoRef,
): Promise<RepoStats | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'personal-blog-portfolio-build',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${ref.owner}/${ref.repo}`,
      { headers },
    );
    if (!res.ok) {
      console.warn(
        `[github] ${ref.owner}/${ref.repo} → ${res.status} ${res.statusText}`,
      );
      return null;
    }
    const body = (await res.json()) as GitHubRepoResponse;
    if (
      typeof body.stargazers_count !== 'number' ||
      typeof body.pushed_at !== 'string'
    ) {
      console.warn(
        `[github] ${ref.owner}/${ref.repo} unexpected API shape`,
      );
      return null;
    }
    return {
      stars: body.stargazers_count,
      lastCommit: body.pushed_at,
      language: body.language,
    };
  } catch (err) {
    console.warn(`[github] ${ref.owner}/${ref.repo} fetch error:`, err);
    return null;
  }
}

export type Project = {
  title: string;
  status: string;
  summary: string;
  stack: readonly string[];
  href: string;
};

export type LiveProject = Project & { live?: RepoStats };

export async function enrichProjects(
  projects: readonly Project[],
): Promise<LiveProject[]> {
  const cache = await readCache();
  const cacheUpdated: CacheFile = { ...cache };

  const result = await Promise.all(
    projects.map(async (project) => {
      const ref = parseGitHubUrl(project.href);
      if (!ref) return { ...project };

      const key = cacheKey(ref);
      const cached = cache[key];
      if (isFresh(cached)) {
        return { ...project, live: cached.stats };
      }

      const stats = await fetchRepoStats(ref);
      if (!stats) return { ...project };

      cacheUpdated[key] = { stats, fetchedAt: Date.now() };
      return { ...project, live: stats };
    }),
  );

  await writeCache(cacheUpdated);
  return result;
}
