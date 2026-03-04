// Configuration for different wordlist systems
export const wordlistSystems = [
  {
    id: 'orchard-qwerty',
    name: 'Orchard Street Short List',
    source: 'https://sts10.github.io/2023/04/03/orchard-street-wordlists.html',
    filename: 'orchard-street-qwerty.txt',
    dictionaryLength: 1296,
    bitsPerWord: 10.3,
  },
  {
    id: 'eff-short1',
    name: 'Diceware - EFF Short List',
    source: 'https://www.eff.org/dice',
    filename: 'eff-short1.txt',
    dictionaryLength: 1296,
    bitsPerWord: 10.3,
  },
  {
    id: 'eff-long',
    name: 'Diceware - EFF Long List',
    source: 'https://www.eff.org/dice',
    filename: 'eff-long.txt',
    dictionaryLength: 7776,
    bitsPerWord: 12.9,
  },
  {
    id: 'orchard-long',
    name: 'Orchard Street Long List',
    source: 'https://sts10.github.io/2023/04/03/orchard-street-wordlists.html',
    filename: 'orchard-street-long.txt',
    dictionaryLength: 17576,
    bitsPerWord: 14.1,
  },
  // {
  //   id: '1password',
  //   name: '1Password List',
  //   source: 'https://www.eff.org/dice',
  //   filename: 'eff-short1.txt',
  //   dictionaryLength: 1296,
  //   bitsPerWord: 10.3,
  // },
];

// Available strongphrase grammar bit lengths from words.js
export const AVAILABLE_STRONGPHRASE_BITS = [44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 80, 90, 100, 110];

// Helper function to select the optimal strongphrase bit length
export const selectStrongphraseBits = (targetMinimumBits: number) => {
  // Find the smallest available bit length that is >= target minimum
  const selectedBits = AVAILABLE_STRONGPHRASE_BITS.find(bits => bits >= targetMinimumBits);
  
  // If no available bit length meets the minimum, return the highest available
  return selectedBits || AVAILABLE_STRONGPHRASE_BITS[AVAILABLE_STRONGPHRASE_BITS.length - 1];
};

// Helper function to get system by ID
export const getSystemById = (id: string) => {
  return wordlistSystems.find(system => system.id === id);
};

// Helper function to get all system IDs
export const getAllSystemIds = () => {
  return wordlistSystems.map(system => system.id);
};

// Helper function to calculate number of words needed for desired entropy
export const calculateWordsNeeded = (systemId: string, desiredBits: number) => {
  const system = getSystemById(systemId);
  if (!system) return null;
  return Math.ceil(desiredBits / system.bitsPerWord);
};

// Helper function to calculate actual entropy bits for a number of words
export const calculateActualEntropy = (systemId: string, numWords: number) => {
  const system = getSystemById(systemId);
  if (!system) return null;
  return numWords * system.bitsPerWord;
};

// Generate passphrase data for all systems
export const generatePassphraseData = (minEntropyBits: number, getRandomWordsFn: (systemId: string, numWords: number) => string | null) => {
  return wordlistSystems.map(system => {
    const wordsNeeded = calculateWordsNeeded(system.id, minEntropyBits);
    const phrase = getRandomWordsFn(system.id, wordsNeeded!);
    const actualEntropy = calculateActualEntropy(system.id, wordsNeeded!);

    return {
      ...system,
      phrase,
      wordsGenerated: wordsNeeded,
      actualEntropyBits: actualEntropy,
      meetsMinimumEntropy: actualEntropy! >= minEntropyBits
    };
  });
};
