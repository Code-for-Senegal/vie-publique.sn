export interface PodcastCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface PodcastEpisode {
  id: number;
  title: string;
  slug: string;
  description?: string;
  youtube_video_id: string;
  youtube_url: string;
  duration?: string;
  date_published: string;
  cover_image?: string;
  tags?: string[];
  category?: PodcastCategory;
  featured?: boolean;
  view_count?: number;
}
