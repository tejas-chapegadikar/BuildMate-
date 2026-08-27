export type Profile = {
  id: string;
  github_username: string | null;
  name: string | null;
  avatar_url: string | null;
  contact: string | null;
  created_at: string;
};

export type PostStatus = "open" | "closed";

export type Post = {
  id: string;
  author_id: string;
  title: string;
  pitch: string;
  looking_for: string[];
  status: PostStatus;
  created_at: string;
};

export type PostWithAuthor = Post & {
  author: Pick<Profile, "id" | "github_username" | "name" | "avatar_url"> | null;
};

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export type Application = {
  id: string;
  post_id: string;
  applicant_id: string;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
};
