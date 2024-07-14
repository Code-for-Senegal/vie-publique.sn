export type Question = {
  question: {
    nom: string;
    photo: string;
  };
  options: string[];
  answer: string;
  explanation: string;
};
