export interface PlagiarismSource {
  sourceText: string;
  url?: string;
  similarity: number;
}

export interface PlagiarismResult {
  plagiarismScore: number;
  summary: string;
  potentialSources: PlagiarismSource[];
}