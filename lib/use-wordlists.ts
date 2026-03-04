import { useState, useEffect } from 'react';
import { wordlistSystems } from './wordlist-config';

const wordlistCache = new Map<string, string[]>();

export const useWordlists = () => {
  const [loadedWordlists, setLoadedWordlists] = useState<Map<string, string[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadWordlists = async () => {
      try {
        const promises = wordlistSystems.map(async (system) => {
          // Check cache first
          if (wordlistCache.has(system.id)) {
            return [system.id, wordlistCache.get(system.id)!] as [string, string[]];
          }

          // Load the wordlist
          const response = await fetch(`/wordlists/${system.filename}`);
          if (!response.ok) throw new Error(`Failed to load ${system.filename}`);
          const text = await response.text();
          const words = text.trim().split('\n');
          
          // Cache the result
          wordlistCache.set(system.id, words);
          return [system.id, words] as [string, string[]];
        });

        const results = await Promise.all(promises);
        setLoadedWordlists(new Map(results));
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    loadWordlists();
  }, []);

  const getRandomWords = (systemId: string, numWords: number) => {
    const words = loadedWordlists.get(systemId);
    if (!words) return null;

    const result: string[] = [];
    for (let i = 0; i < numWords; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      result.push(words[randomIndex]);
    }
    return result.join(' ');
  };

  return {
    getRandomWords,
    isLoading,
    error,
    isLoaded: !isLoading && !error
  };
};
