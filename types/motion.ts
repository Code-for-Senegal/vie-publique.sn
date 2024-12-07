export type Motion = {
    id: number;
    type: 'law_project' | 'constitution_amendment' | 'budget_vote';
    title: string;
    description: string;
    vote_count: number;
    yes_count: number;
    no_count: number;
    theme: string;
}
