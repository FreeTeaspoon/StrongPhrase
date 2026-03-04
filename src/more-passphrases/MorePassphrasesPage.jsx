import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { timeToCrackAvg, convertTimeToReadableFormat, getPassphrase, formatDollarToScale, avgCostToCrack } from '../passphraseUtils';
import PageToolbar from '../components/PageToolbar';
import CopyableItem from '../components/CopyableItem';
import { useWordlists } from './useWordlists';
import { selectStrongphraseBits, wordlistSystems } from './wordlistConfig';
import { defaultHashRates } from '../HashRateSelector';
import { FaInfoCircle } from 'react-icons/fa';
import FAQItem from '../FAQItem';

const MIN_ENTROPY_BITS = 44;
const MAX_ENTROPY_BITS = 110;
const DEFAULT_ENTROPY_BITS = 60;
const DEFAULT_HASH_RATE = defaultHashRates.passphrase; // Use same default as EntropyCrackTable
const DEFAULT_COST_PER_GUESS32 = 0.50; // Use same default as EntropyCrackTable

// Progress bar component for showing bit strength
const BitProgressBar = ({ currentBits, minBits = MIN_ENTROPY_BITS, maxBits = MAX_ENTROPY_BITS, refreshAnimation = false }) => {
  const percentage = Math.min(100, Math.max(0, ((currentBits - minBits) / (maxBits - minBits)) * 100));
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div 
        className={`bg-primary h-1.5 rounded-full transition-all duration-300 ease-out ${refreshAnimation ? 'refresh-animation' : ''}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const MorePassphrasesDisplay = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize entropyBits from URL param or default
  const urlBits = searchParams.get('bits');
  const initialBits = urlBits ? parseInt(urlBits) : DEFAULT_ENTROPY_BITS;
  const [entropyBits, setEntropyBits] = useState(initialBits);
  
  // Check for hide_slider parameter
  const hideSlider = searchParams.get('hide_slider') === 'true';
  
  const [copiedBits, setCopiedBits] = useState(null);
  const [showHidden, setShowHidden] = useState(true);
  const { getRandomWords, isLoading, error } = useWordlists();
  
  // Individual state for each format
  const [strongphraseState, setStrongphraseState] = useState({
    phrase: '',
    bitLength: 0,
    generationCount: 0
  });
  
  const [wordlistStates, setWordlistStates] = useState({});
  
  // Track which items are showing refresh animation
  const [refreshedItems, setRefreshedItems] = useState(new Set());
  
  // Add logging for component mount
  useEffect(() => {
    console.log('MorePassphrasesDisplay mounted');
  }, []);

  // Handle URL parameter changes
  useEffect(() => {
    const urlBits = searchParams.get('bits');
    if (urlBits) {
      const newBits = parseInt(urlBits);
      if (newBits !== entropyBits && newBits >= MIN_ENTROPY_BITS && newBits <= MAX_ENTROPY_BITS) {
        setEntropyBits(newBits);
      }
    }
  }, [searchParams, entropyBits]);

  // Update URL params when entropyBits changes
  const updateUrlParams = useCallback((params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleEntropyChange = (e) => {
    const newBits = parseInt(e.target.value);
    setEntropyBits(newBits);
    updateUrlParams({ bits: newBits.toString() });
  };

  // Calculate the required bit length for strongphrase
  const getStrongphraseBitLength = useCallback((targetBits) => {
    return selectStrongphraseBits(targetBits);
  }, []);

  // Calculate the required bit length for a wordlist system
  const getWordlistBitLength = useCallback((systemId, targetBits) => {
    const system = wordlistSystems.find(s => s.id === systemId);
    if (!system) return 0;
    const wordsNeeded = Math.ceil(targetBits / system.bitsPerWord);
    return wordsNeeded * system.bitsPerWord;
  }, []);

  // Trigger refresh animation for an item
  const triggerRefreshAnimation = useCallback((itemId) => {
    setRefreshedItems(prev => new Set([...prev, itemId]));
    
    // Remove the animation class after 1 second
    setTimeout(() => {
      setRefreshedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 500);
  }, []);

  // Generate strongphrase only if bit length changed
  const generateStrongphrase = useCallback((targetBits, skipAnimation = false) => {
    const newBitLength = getStrongphraseBitLength(targetBits);
    
    if (newBitLength !== strongphraseState.bitLength) {
      const newPhrase = getPassphrase(newBitLength);
      setStrongphraseState({
        phrase: newPhrase,
        bitLength: newBitLength,
        generationCount: strongphraseState.generationCount + 1
      });
      
      // Trigger refresh animation only if not skipping
      if (!skipAnimation) {
        triggerRefreshAnimation('strongphrase');
      }
    }
  }, [strongphraseState.bitLength, strongphraseState.generationCount, getStrongphraseBitLength, triggerRefreshAnimation]);

  // Generate wordlist passphrase only if bit length changed
  const generateWordlistPassphrase = useCallback((systemId, targetBits, skipAnimation = false) => {
    if (!getRandomWords) return;
    
    const newBitLength = getWordlistBitLength(systemId, targetBits);
    const currentState = wordlistStates[systemId];
    
    if (!currentState || newBitLength !== currentState.bitLength) {
      const system = wordlistSystems.find(s => s.id === systemId);
      const wordsNeeded = Math.ceil(targetBits / system.bitsPerWord);
      const phrase = getRandomWords(systemId, wordsNeeded);
      const actualEntropy = wordsNeeded * system.bitsPerWord;
      
      setWordlistStates(prev => ({
        ...prev,
        [systemId]: {
          phrase,
          bitLength: newBitLength,
          wordsGenerated: wordsNeeded,
          actualEntropyBits: actualEntropy,
          generationCount: (currentState?.generationCount || 0) + 1
        }
      }));
      
      // Trigger refresh animation only if not skipping
      if (!skipAnimation) {
        triggerRefreshAnimation(systemId);
      }
    }
  }, [wordlistStates, getRandomWords, getWordlistBitLength, triggerRefreshAnimation]);

  const generateNewPassphrases = useCallback((skipAnimation = false) => {
    console.log('generateNewPassphrases called with:', { entropyBits, isLoading, hasGetRandomWords: !!getRandomWords });
    
    // Force regenerate strongphrase regardless of bit length
    const strongphraseBits = getStrongphraseBitLength(entropyBits);
    const newStrongPhrase = getPassphrase(strongphraseBits);
    setStrongphraseState({
      phrase: newStrongPhrase,
      bitLength: strongphraseBits,
      generationCount: strongphraseState.generationCount + 1
    });
    if (!skipAnimation) {
      triggerRefreshAnimation('strongphrase');
    }

    // Force regenerate wordlist phrases regardless of bit length
    if (!isLoading && getRandomWords) {
      wordlistSystems.forEach(system => {
        const wordsNeeded = Math.ceil(entropyBits / system.bitsPerWord);
        const phrase = getRandomWords(system.id, wordsNeeded);
        const actualEntropy = wordsNeeded * system.bitsPerWord;
        
        setWordlistStates(prev => ({
          ...prev,
          [system.id]: {
            phrase,
            bitLength: actualEntropy,
            wordsGenerated: wordsNeeded,
            actualEntropyBits: actualEntropy,
            generationCount: (prev[system.id]?.generationCount || 0) + 1
          }
        }));
        
        if (!skipAnimation) {
          triggerRefreshAnimation(system.id);
        }
      });
    }

    setCopiedBits(null);
    setShowHidden(true);
  }, [entropyBits, isLoading, getRandomWords, getStrongphraseBitLength, strongphraseState.generationCount, triggerRefreshAnimation]);

  // Initial generation and regeneration when dependencies change
  useEffect(() => {
    console.log('Initial generation effect triggered:', { isLoading, entropyBits });
    if (!isLoading) {
      // Skip animation on initial load
      generateStrongphrase(entropyBits, true);

      if (getRandomWords) {
        wordlistSystems.forEach(system => {
          generateWordlistPassphrase(system.id, entropyBits, true);
        });
      }

      setCopiedBits(null);
      setShowHidden(true);
    }
  }, [isLoading, entropyBits, getRandomWords, generateStrongphrase, generateWordlistPassphrase]);

  const copyToClipboard = (text, bits) => {
    navigator.clipboard.writeText(text);
    setCopiedBits(null);
    setTimeout(() => {
      setCopiedBits(bits);
    }, 10);
    setShowHidden(false);
  };

  // Calculate crack time and cost before any rendering decisions
  const crackTime = convertTimeToReadableFormat(timeToCrackAvg(entropyBits, DEFAULT_HASH_RATE));
  const crackCost = formatDollarToScale(avgCostToCrack(entropyBits, DEFAULT_COST_PER_GUESS32));

  if (error) {
    return <div className="text-center text-red-500">Error loading wordlists: {error.message}</div>;
  }

  return (
    <section className="content">
      <PageToolbar
        className="mb-10"
        isSticky={true}
        onGenerate={() => generateNewPassphrases(true)}
        generateButtonText=""
        alwaysShowChildren={true}
      >
        {!hideSlider && (
          <div className="flex items-center w-full">
            <div className="w-full md:w-[60%] ml-4">
              <div className="relative h-8">
                <div 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold"
                >
                  {entropyBits} bits
                </div>
              </div>
              <input
                type="range"
                min={MIN_ENTROPY_BITS}
                max={MAX_ENTROPY_BITS}
                // step={STEP_ENTROPY_BITS}
                value={entropyBits}
                onChange={handleEntropyChange}
                className="range range-md md:range-lg range-primary w-full"
              />
              <div className="flex justify-between text-xs mt-1">
                <span>{MIN_ENTROPY_BITS}</span>
                <span className="text-gray-500">Minimum bits of entropy</span>
                <span>{MAX_ENTROPY_BITS}</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 hidden md:block ml-8 w-[35%]">
              <div className="flex items-center gap-1">
                <strong>{crackTime}</strong> to crack (avg)
                <div className="tooltip tooltip-top" data-tip={`${(DEFAULT_HASH_RATE / 1e6).toFixed(1)} million hashes/sec`}>
                  <FaInfoCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <strong>{crackCost}</strong> to crack (avg)
                <div className="tooltip tooltip-top" data-tip={`$${DEFAULT_COST_PER_GUESS32} per 2^32 guesses`}>
                  <FaInfoCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </div>
              </div>
            </div>
          </div>
        )}
        {hideSlider && (
          <div className="flex ml-4 mt-4 w-full">
            <div className="">
              <div className="text-xl font-bold mb-2">{entropyBits} bits of entropy</div>
            </div>
          </div>
        )}
      </PageToolbar>

      <div className="space-y-8">

        {/* Strongphrase passphrase */}
        {strongphraseState.phrase && (
          <CopyableItem
            label={`Strongphrase (${strongphraseState.bitLength} bits) - easy to remember, but more characters to type`}
            content={strongphraseState.phrase}
            copyToClipboard={copyToClipboard}
            copiedId={copiedBits}
            itemId={`strongphrase-${strongphraseState.bitLength}`}
            generationCount={strongphraseState.generationCount}
            showHidden={showHidden}
            hideCopyTextBelowLg={true}
            className="max-w-full recommended-passcode"
            refreshAnimation={refreshedItems.has('strongphrase')}
            additionalContent={<BitProgressBar currentBits={strongphraseState.bitLength} refreshAnimation={refreshedItems.has('strongphrase')} />}
          />
        )}
        
        {/* Additional wordlist systems */}
        {!isLoading && wordlistSystems.map(system => {
          const state = wordlistStates[system.id];
          if (!state) return null;
          
          return (
            <CopyableItem
              key={system.id}
              content={state.phrase}
              label={`${system.name} (${state.wordsGenerated} words * ${system.bitsPerWord} bits/word = ${state.actualEntropyBits.toFixed(0)} bits)`}
              infoBits={`${system.dictionaryLength.toLocaleString()} words in dictionary`}
              copyToClipboard={copyToClipboard}
              copiedId={copiedBits}
              itemId={system.id}
              generationCount={state.generationCount}
              showHidden={showHidden}
              hideCopyTextBelowLg={true}
              className="max-w-full"
              sourceLink={system.source}
              refreshAnimation={refreshedItems.has(system.id)}
              additionalContent={<BitProgressBar currentBits={state.actualEntropyBits} refreshAnimation={refreshedItems.has(system.id)} />}
            />
          );
        })}
        {isLoading && <div className="text-center py-4">Loading additional wordlists...</div>}

      </div>
    </section>
  );
};

const MorePassphrasesPage = () => (
  <div className="container mx-auto p-4">
    <h2 className="page-title">More Passphrase Formats</h2>
    <MorePassphrasesDisplay />
    <section className="content faq-overall-container markdown-content mt-12" id="FAQ">
      <h1 className="section-header">FAQ</h1>
      <div className="faq-container">
        <FAQItem
          question="Why are these passphrases secure?"
          id="why-secure"
          answer="See the [FAQ on the main page](https://strongphrase.net/#FAQ) for why passphrases are strong, how entropy works, and how we compare to other password schemes."
        />
        <FAQItem
          question="How do URL parameters work? (advanced)"
          id="url-params"
          answer={`
            You can control the page via query parameters for bookmarking or embedding:

            * **\`bits\`** — Target entropy in bits. Valid range: ${MIN_ENTROPY_BITS}–${MAX_ENTROPY_BITS}. The slider and all passphrase formats use this value. Omit for the default (${DEFAULT_ENTROPY_BITS} bits).
            * **\`hide_slider\`** — Set to \`true\` to hide the entropy slider and show only the current bit count. Useful for fixed-strength links or minimal UI.

            **Examples:**

            [https://strongphrase.net/more?bits=80&hide_slider=true](https://strongphrase.net/more?bits=80&hide_slider=true)

            [https://strongphrase.net/more?bits=72](https://strongphrase.net/more?bits=72)
          `}
        />
      </div>
    </section>
  </div>
);

export default MorePassphrasesPage; 