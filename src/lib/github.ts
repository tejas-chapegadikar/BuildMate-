type GitHubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  pushed_at: string;
};

type GitHubUser = {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
};

export type GitHubProfileData = {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  publicRepos: number;
  followers: number;
  topLanguages: string[];
  topRepos: {
    name: string;
    description: string | null;
    url: string;
    stars: number;
    language: string | null;
  }[];
};

/**
 * Live public GitHub data for a username — no token needed, unauthenticated
 * rate limit (60 req/hr per server IP) is fine at this scale. Cached for an
 * hour via Next's fetch cache so a popular profile doesn't burn the budget.
 */
export async function fetchGitHubProfile(username: string): Promise<GitHubProfileData | null> {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "buildmate-app",
  };

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, {
      headers,
      next: { revalidate: 3600 },
    }),
    fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`, {
      headers,
      next: { revalidate: 3600 },
    }),
  ]);

  if (!userRes.ok) return null;
  const user = (await userRes.json()) as GitHubUser;
  const repos = reposRes.ok ? ((await reposRes.json()) as GitHubRepo[]) : [];

  const languageCounts = new Map<string, number>();
  for (const repo of repos) {
    if (repo.language) {
      languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
    }
  }
  const topLanguages = [...languageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang]) => lang);

  const topRepos = repos
    .filter((r) => !r.fork)
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    )
    .slice(0, 6)
    .map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      stars: r.stargazers_count,
      language: r.language,
    }));

  return {
    login: user.login,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    topLanguages,
    topRepos,
  };
}
