export interface GroundingSource {
  uri: string;
  title: string;
}

export interface SearchGroundingResult {
  answer: string;
  sources: GroundingSource[];
  searchQueries: string[];
}

export async function queryGoogleSearchGrounding(params: {
  query: string;
  mode?: 'research' | 'seo-check';
  articleTitle?: string;
}): Promise<SearchGroundingResult> {
  const response = await fetch('/api/search-grounding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'Falha ao consultar o Google Search.');
  }

  return {
    answer: data.answer || '',
    sources: Array.isArray(data.sources) ? data.sources : [],
    searchQueries: Array.isArray(data.searchQueries) ? data.searchQueries : [],
  };
}
