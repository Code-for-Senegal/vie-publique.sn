// types/coalition.ts

export interface Video {
  date: string;
  url_youtube: string;
}

export interface HeadOfList {
  last_name: string;
  first_name: string;
  photo: string;
}

export interface Coalition {
  id: number;
  name: string;
  list_order: number;
  logo: string | null;
  bulletin: string | null;
  videos: Video[];
  head_of_list: HeadOfList;
}
