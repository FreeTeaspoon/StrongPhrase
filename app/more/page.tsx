"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  timeToCrackAvg,
  convertTimeToReadableFormat,
  getPassphrase,
  formatDollarToScale,
  avgCostToCrack,
} from "@/lib/passphrase-utils";
import PageToolbar from "@/components/page-toolbar";
import CopyableItem from "@/components/copyable-item";
import { useWordlists } from "@/lib/use-wordlists";
import { selectStrongphraseBits, wordlistSystems } from "@/lib/wordlist-config";
import { defaultHashRates } from "@/components/hash-rate-selector";
import { FaInfoCircle } from "react-icons/fa";
import FAQItem from "@/components/faq-item";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MIN_ENTROPY_BITS = 44;
const MAX_ENTROPY_BITS = 110;
const DEFAULT_ENTROPY_BITS = 60;
const DEFAULT_HASH_RATE = defaultHashRates.passphrase;
const DEFAULT_COST_PER_GUESS32 = 0.5;

function BitProgressBar({
  currentBits,
  minBits = MIN_ENTROPY_BITS,
  maxBits = MAX_ENTROPY_BITS,
  refreshAnimation = false,
}: {
  currentBits: number;
  minBits?: number;
  maxBits?: number;
  refreshAnimation?: boolean;
}) {
  const percentage = Math.min(
    100,
    Math.max(0, ((currentBits - minBits) / (maxBits - minBits)) * 100)
  );

  return (
    <div className="w-full rounded-full bg-muted h-1.5">
      <div
        className={`bg-primary h-1.5 rounded-full transition-all duration-300 ease-out ${refreshAnimation ? "animate-pulse" : ""}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function MorePassphrasesDisplay() {
  const searchParams = useSearchParams();

  const urlBits = searchParams.get("bits");
  const initialBits = urlBits ? parseInt(urlBits) : DEFAULT_ENTROPY_BITS;
  const [entropyBits, setEntropyBits] = useState(initialBits);

  const hideSlider = searchParams.get("hide_slider") === "true";

  const [copiedBits, setCopiedBits] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(true);
  const { getRandomWords, isLoading, error } = useWordlists();

  const [strongphraseState, setStrongphraseState] = useState({
    phrase: "",
    bitLength: 0,
    generationCount: 0,
  });

  const [wordlistStates, setWordlistStates] = useState<
    Record<
      string,
      {
        phrase: string;
        bitLength: number;
        wordsGenerated: number;
        actualEntropyBits: number;
        generationCount: number;
      }
    >
  >({});

  const [refreshedItems, setRefreshedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const urlBits = searchParams.get("bits");
    if (urlBits) {
      const newBits = parseInt(urlBits);
      if (
        newBits !== entropyBits &&
        newBits >= MIN_ENTROPY_BITS &&
        newBits <= MAX_ENTROPY_BITS
      ) {
        setEntropyBits(newBits);
      }
    }
  }, [searchParams, entropyBits]);

  const updateUrlParams = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      window.history.replaceState(null, "", `?${newParams.toString()}`);
    },
    [searchParams]
  );

  const handleEntropyChange = (values: number[]) => {
    const newBits = values[0];
    setEntropyBits(newBits);
    updateUrlParams({ bits: newBits.toString() });
  };

  const getStrongphraseBitLength = useCallback((targetBits: number) => {
    return selectStrongphraseBits(targetBits);
  }, []);

  const getWordlistBitLength = useCallback(
    (systemId: string, targetBits: number) => {
      const system = wordlistSystems.find((s) => s.id === systemId);
      if (!system) return 0;
      const wordsNeeded = Math.ceil(targetBits / system.bitsPerWord);
      return wordsNeeded * system.bitsPerWord;
    },
    []
  );

  const triggerRefreshAnimation = useCallback((itemId: string) => {
    setRefreshedItems((prev) => new Set([...prev, itemId]));
    setTimeout(() => {
      setRefreshedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 500);
  }, []);

  const generateStrongphrase = useCallback(
    (targetBits: number, skipAnimation = false) => {
      const newBitLength = getStrongphraseBitLength(targetBits);

      if (newBitLength !== strongphraseState.bitLength) {
        const newPhrase = getPassphrase(newBitLength);
        setStrongphraseState({
          phrase: newPhrase,
          bitLength: newBitLength,
          generationCount: strongphraseState.generationCount + 1,
        });
        if (!skipAnimation) {
          triggerRefreshAnimation("strongphrase");
        }
      }
    },
    [
      strongphraseState.bitLength,
      strongphraseState.generationCount,
      getStrongphraseBitLength,
      triggerRefreshAnimation,
    ]
  );

  const generateWordlistPassphrase = useCallback(
    (systemId: string, targetBits: number, skipAnimation = false) => {
      if (!getRandomWords) return;

      const newBitLength = getWordlistBitLength(systemId, targetBits);
      const currentState = wordlistStates[systemId];

      if (!currentState || newBitLength !== currentState.bitLength) {
        const system = wordlistSystems.find((s) => s.id === systemId);
        if (!system) return;
        const wordsNeeded = Math.ceil(targetBits / system.bitsPerWord);
        const phrase = getRandomWords(systemId, wordsNeeded);
        const actualEntropy = wordsNeeded * system.bitsPerWord;

        setWordlistStates((prev) => ({
          ...prev,
          [systemId]: {
            phrase: phrase ?? "",
            bitLength: newBitLength,
            wordsGenerated: wordsNeeded,
            actualEntropyBits: actualEntropy,
            generationCount: (currentState?.generationCount || 0) + 1,
          },
        }));

        if (!skipAnimation) {
          triggerRefreshAnimation(systemId);
        }
      }
    },
    [wordlistStates, getRandomWords, getWordlistBitLength, triggerRefreshAnimation]
  );

  const generateNewPassphrases = useCallback(
    (skipAnimation = false) => {
      const strongphraseBits = getStrongphraseBitLength(entropyBits);
      const newStrongPhrase = getPassphrase(strongphraseBits);
      setStrongphraseState({
        phrase: newStrongPhrase,
        bitLength: strongphraseBits,
        generationCount: strongphraseState.generationCount + 1,
      });
      if (!skipAnimation) {
        triggerRefreshAnimation("strongphrase");
      }

      if (!isLoading && getRandomWords) {
        wordlistSystems.forEach((system) => {
          const wordsNeeded = Math.ceil(entropyBits / system.bitsPerWord);
          const phrase = getRandomWords(system.id, wordsNeeded);
          const actualEntropy = wordsNeeded * system.bitsPerWord;

          setWordlistStates((prev) => ({
            ...prev,
            [system.id]: {
              phrase: phrase ?? "",
              bitLength: actualEntropy,
              wordsGenerated: wordsNeeded,
              actualEntropyBits: actualEntropy,
              generationCount: (prev[system.id]?.generationCount || 0) + 1,
            },
          }));

          if (!skipAnimation) {
            triggerRefreshAnimation(system.id);
          }
        });
      }

      setCopiedBits(null);
      setShowHidden(true);
    },
    [
      entropyBits,
      isLoading,
      getRandomWords,
      getStrongphraseBitLength,
      strongphraseState.generationCount,
      triggerRefreshAnimation,
    ]
  );

  useEffect(() => {
    if (!isLoading) {
      generateStrongphrase(entropyBits, true);

      if (getRandomWords) {
        wordlistSystems.forEach((system) => {
          generateWordlistPassphrase(system.id, entropyBits, true);
        });
      }

      setCopiedBits(null);
      setShowHidden(true);
    }
  }, [isLoading, entropyBits, getRandomWords, generateStrongphrase, generateWordlistPassphrase]);

  const copyToClipboard = (text: string, bits: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBits(null);
    setTimeout(() => {
      setCopiedBits(bits);
    }, 10);
    setShowHidden(false);
  };

  const crackTime = convertTimeToReadableFormat(
    timeToCrackAvg(entropyBits, DEFAULT_HASH_RATE)
  );
  const crackCost = formatDollarToScale(
    avgCostToCrack(entropyBits, DEFAULT_COST_PER_GUESS32)
  );

  if (error) {
    return (
      <div className="text-center text-destructive">
        Error loading wordlists: {error.message}
      </div>
    );
  }

  return (
    <section>
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
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
                  {entropyBits} bits
                </div>
              </div>
              <Slider
                min={MIN_ENTROPY_BITS}
                max={MAX_ENTROPY_BITS}
                step={1}
                value={[entropyBits]}
                onValueChange={handleEntropyChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-1">
                <span>{MIN_ENTROPY_BITS}</span>
                <span className="text-muted-foreground">
                  Minimum bits of entropy
                </span>
                <span>{MAX_ENTROPY_BITS}</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground hidden md:block ml-8 w-[35%]">
              <div className="flex items-center gap-1">
                <strong>{crackTime}</strong> to crack (avg)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">
                        <FaInfoCircle className="w-4 h-4 text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {(DEFAULT_HASH_RATE / 1e6).toFixed(1)} million hashes/sec
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-1">
                <strong>{crackCost}</strong> to crack (avg)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">
                        <FaInfoCircle className="w-4 h-4 text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      ${DEFAULT_COST_PER_GUESS32} per 2^32 guesses
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        )}
        {hideSlider && (
          <div className="flex ml-4 mt-4 w-full">
            <div>
              <div className="text-xl font-bold mb-2">
                {entropyBits} bits of entropy
              </div>
            </div>
          </div>
        )}
      </PageToolbar>

      <div className="space-y-8">
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
            className="max-w-full"
            refreshAnimation={refreshedItems.has("strongphrase")}
            additionalContent={
              <BitProgressBar
                currentBits={strongphraseState.bitLength}
                refreshAnimation={refreshedItems.has("strongphrase")}
              />
            }
          />
        )}

        {!isLoading &&
          wordlistSystems.map((system) => {
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
                additionalContent={
                  <BitProgressBar
                    currentBits={state.actualEntropyBits}
                    refreshAnimation={refreshedItems.has(system.id)}
                  />
                }
              />
            );
          })}
        {isLoading && (
          <div className="text-center py-4">Loading additional wordlists...</div>
        )}
      </div>
    </section>
  );
}

export default function MorePassphrasesPage() {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-heading font-bold mb-4">
        More Passphrase Formats
      </h2>
      <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
        <MorePassphrasesDisplay />
      </Suspense>
      <section className="mt-12 space-y-6" id="FAQ">
        <h2 className="text-2xl font-heading font-bold">FAQ</h2>
        <div className="space-y-6">
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
}
