import type { TSearchCompletions, TChatCompletionChunkResponse } from './types';
import { ConfigDict } from '@/util/constants';
import { logRequest } from '@/util/logRequest';

export const getSearchCompletions = async ({
  searchTerm,
  typeDoc,
  searchLimit = 25,
  aiToken,
  onDataChunk
}: TSearchCompletions & { onDataChunk?: (chunk: string) => void }): Promise<void> => {
  const contentType = typeDoc ? 'dotcmsdocumentation' : '';

  try {
    await logRequest(async () => {
      const response = await fetch(`${ConfigDict.DotCMSHost}/api/v1/ai/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aiToken}`
        },
        body: JSON.stringify({
          contentType,
          prompt: searchTerm,
          searchLimit,
          stream: true,
          temperature: 0.5,
          threshold: 0.25,
          responseLengthTokens: 512
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        chunk.split('\n').forEach(line => {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.replace('data: ', '').trim();
              const jsonData: TChatCompletionChunkResponse = JSON.parse(jsonStr);

              const content = jsonData.choices[0]?.delta?.content || '';
              if (content && onDataChunk) {
                onDataChunk(content);
              }
            } catch (jsonError: unknown) {
              if (jsonError instanceof Error) {
                console.error('Error parsing JSON chunk:', jsonError.message);
              }
            }
          }
        });
      }
    }, 'getSearchCompletions'); 
  } catch (error) {
    console.error('Error fetching search results:', error);
  }
};
