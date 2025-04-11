import type { Vote } from "./vote";

export type Deputy = {
  id: number;
  first_name: string;
  last_name: string;
  profession: string;
  photo: string;
  gender: string;
  birthplace: string;
  birthdate: string;
  biography: string;
  bio: string;
  electoral_list: {
    type: string;
    name: string;
    coalition: {
      name: string;
      color: string;
    };
    constituency: {
      name: string;
    };
  };
  votes: Vote[];
};
