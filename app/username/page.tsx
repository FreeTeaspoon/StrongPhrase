"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { generateUsername } from "@/lib/username-generator";
import CopyableItem from "@/components/copyable-item";
import PageToolbar from "@/components/page-toolbar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsernameData {
  username: string;
  components: string[];
  entropy: number;
  type: string;
  section: string;
}

function UsernameDisplay() {
  const searchParams = useSearchParams();
  const [usernames, setUsernames] = useState<Record<string, UsernameData>>({});
  const [copiedBits, setCopiedBits] = useState<string | null>(null);
  const [includeNumbers, setIncludeNumbers] = useState(
    searchParams.get("numbers") === "true"
  );
  const [capitalize, setCapitalize] = useState(
    searchParams.get("capitalize") !== "false"
  );
  const [useSeparators, setUseSeparators] = useState(
    searchParams.get("separators") === "true"
  );
  const sepParam = searchParams.get("sep") || "dash";
  const [separatorType, setSeparatorType] = useState(
    sepParam === "underscore"
      ? "underscore"
      : sepParam === "random"
        ? "random"
        : "dash"
  );
  const [separatorRandomByKey, setSeparatorRandomByKey] = useState<
    Record<string, string>
  >({});
  const [randomizePerItem, setRandomizePerItem] = useState(
    searchParams.get("randomize") === "true"
  );
  const [itemOptions, setItemOptions] = useState<
    Record<
      string,
      { separatorChar: string; capitalize: boolean; includeNumbers: boolean }
    >
  >({});
  const [generationCount, setGenerationCount] = useState(0);

  const entropyLevels: Record<string, number> = {
    animal: 20,
    concrete: 24,
    animate: 28,
  };

  const sectionLabels: Record<string, string> = {
    animal: "Animal Usernames",
    other: "Other Usernames",
  };

  const counts: Record<string, number> = {
    animal: 8,
    concrete: 4,
    animate: 4,
  };

  const numberColor = "text-green-700";

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

  const generateUsernames = useCallback(() => {
    const usernameData: Record<string, UsernameData> = {};

    for (let i = 0; i < counts.animal; i++) {
      const suffix = i === 0 ? "" : ` ${i + 1}`;
      usernameData[`animal${suffix}`] = {
        ...generateUsername(entropyLevels.animal),
        entropy: entropyLevels.animal,
        type: "animal",
        section: "animal",
      };
    }

    for (let i = 0; i < counts.concrete; i++) {
      const suffix = i === 0 ? "" : ` ${i + 1}`;
      usernameData[`concrete${suffix}`] = {
        ...generateUsername(entropyLevels.concrete),
        entropy: entropyLevels.concrete,
        type: "concrete",
        section: "other",
      };
    }

    for (let i = 0; i < counts.animate; i++) {
      const suffix = i === 0 ? "" : ` ${i + 1}`;
      usernameData[`animate${suffix}`] = {
        ...generateUsername(entropyLevels.animate),
        entropy: entropyLevels.animate,
        type: "animate",
        section: "other",
      };
    }

    const options: Record<
      string,
      { separatorChar: string; capitalize: boolean; includeNumbers: boolean }
    > = {};
    const sepRandom: Record<string, string> = {};
    const randomSepChoices = ["", "-", "_"];
    Object.keys(usernameData).forEach((key) => {
      options[key] = {
        separatorChar:
          randomSepChoices[Math.floor(Math.random() * 3)],
        capitalize: Math.random() < 0.5,
        includeNumbers: Math.random() < 0.5,
      };
      sepRandom[key] =
        randomSepChoices[Math.floor(Math.random() * 3)];
    });
    setItemOptions(options);
    setSeparatorRandomByKey(sepRandom);
    setCopiedBits(null);
    setUsernames(usernameData);
    setGenerationCount((c) => c + 1);
  }, [counts.animal, counts.concrete, counts.animate, entropyLevels.animal, entropyLevels.concrete, entropyLevels.animate]);

  const copyToClipboard = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBits(null);
    setTimeout(() => {
      setCopiedBits(type);
    }, 10);
  }, []);

  useEffect(() => {
    generateUsernames();
  }, [generateUsernames]);

  const getEffectiveOptions = useCallback(
    (itemKey: string) => {
      if (randomizePerItem && itemOptions[itemKey]) {
        const o = itemOptions[itemKey];
        return {
          includeNumbers: o.includeNumbers,
          capitalize: o.capitalize,
          useSeparators: o.separatorChar !== "",
          separatorChar: o.separatorChar || "-",
        };
      }
      if (
        useSeparators &&
        separatorType === "random" &&
        separatorRandomByKey[itemKey] !== undefined
      ) {
        const sep = separatorRandomByKey[itemKey];
        return {
          includeNumbers,
          capitalize,
          useSeparators: sep !== "",
          separatorChar: sep || "-",
        };
      }
      const separatorChar = separatorType === "underscore" ? "_" : "-";
      return { includeNumbers, capitalize, useSeparators, separatorChar };
    },
    [
      randomizePerItem,
      itemOptions,
      includeNumbers,
      capitalize,
      useSeparators,
      separatorType,
      separatorRandomByKey,
    ]
  );

  const getDisplayComponents = useCallback(
    (components: string[], optIncludeNumbers?: boolean) => {
      const includeNum =
        optIncludeNumbers !== undefined ? optIncludeNumbers : includeNumbers;
      return includeNum ? components : components.slice(0, -1);
    },
    [includeNumbers]
  );

  const formatComponent = useCallback(
    (
      component: string,
      _index: number,
      _totalComponents: number,
      optCapitalize?: boolean
    ) => {
      const cap = optCapitalize !== undefined ? optCapitalize : capitalize;
      if (cap) {
        const firstChar = component.charAt(0);
        if (firstChar === firstChar.toLowerCase()) {
          return firstChar.toUpperCase() + component.slice(1);
        }
      }
      return component;
    },
    [capitalize]
  );

  const getSeparator = useCallback(
    (optUseSeparators?: boolean, optSeparatorChar?: string) => {
      const useSep =
        optUseSeparators !== undefined ? optUseSeparators : useSeparators;
      const sepChar =
        optSeparatorChar !== undefined
          ? optSeparatorChar
          : separatorType === "underscore"
            ? "_"
            : "-";
      return useSep ? sepChar : "";
    },
    [useSeparators, separatorType]
  );

  const getDisplayUsername = useCallback(
    (components: string[], itemKey: string) => {
      const opt = getEffectiveOptions(itemKey);
      const sep = getSeparator(opt.useSeparators, opt.separatorChar);
      return getDisplayComponents(components, opt.includeNumbers)
        .map((component, index, array) =>
          formatComponent(component, index, array.length, opt.capitalize)
        )
        .join(sep);
    },
    [getEffectiveOptions, getDisplayComponents, formatComponent, getSeparator]
  );

  const getComponentColor = useCallback(
    (
      _component: string,
      index: number,
      totalComponents: number,
      optIncludeNumbers?: boolean
    ) => {
      const wordColors = [
        "text-blue-600",
        "text-red-600",
        "text-purple-600",
      ];
      const includeNum =
        optIncludeNumbers !== undefined ? optIncludeNumbers : includeNumbers;
      if (includeNum && index === totalComponents - 1) {
        return numberColor;
      }
      return wordColors[index % wordColors.length];
    },
    [includeNumbers, numberColor]
  );

  const renderUsernameContent = useCallback(
    (components: string[], itemKey: string) => {
      const opt = getEffectiveOptions(itemKey);
      const displayComponents = getDisplayComponents(
        components,
        opt.includeNumbers
      );
      const sep = getSeparator(opt.useSeparators, opt.separatorChar);
      return displayComponents.map((component, index) => (
        <span key={index}>
          <span
            className={getComponentColor(
              component,
              index,
              displayComponents.length,
              opt.includeNumbers
            )}
          >
            {formatComponent(
              component,
              index,
              displayComponents.length,
              opt.capitalize
            )}
          </span>
          {sep && index < displayComponents.length - 1 && (
            <span className="text-muted-foreground">{sep}</span>
          )}
        </span>
      ));
    },
    [
      getEffectiveOptions,
      getDisplayComponents,
      getComponentColor,
      formatComponent,
      getSeparator,
    ]
  );

  const handleIncludeNumbersChange = (checked: boolean) => {
    setIncludeNumbers(checked);
    updateUrlParams({ numbers: checked === false ? null : "true" });
  };

  const handleCapitalizeChange = (checked: boolean) => {
    setCapitalize(checked);
    updateUrlParams({ capitalize: checked === true ? null : "false" });
  };

  const handleUseSeparatorsChange = (checked: boolean) => {
    setUseSeparators(checked);
    updateUrlParams({ separators: checked ? "true" : null });
  };

  const handleSeparatorTypeChange = (value: string) => {
    setSeparatorType(value);
    updateUrlParams({ sep: value === "dash" ? null : value });
  };

  const handleRandomizePerItemChange = (checked: boolean) => {
    setRandomizePerItem(checked);
    updateUrlParams({ randomize: checked ? "true" : null });
  };

  const groupedUsernames = Object.entries(usernames).reduce(
    (acc, [key, data]) => {
      const { section } = data;
      if (!acc[section]) acc[section] = [];
      acc[section].push([key, data] as [string, UsernameData]);
      return acc;
    },
    {} as Record<string, [string, UsernameData][]>
  );

  return (
    <section className="h-full">
      <PageToolbar
        onGenerate={generateUsernames}
        generateButtonText="More"
        isSticky={true}
        className="items-center"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Checkbox
              id="randomize"
              checked={randomizePerItem}
              onCheckedChange={handleRandomizePerItemChange}
            />
            <Label htmlFor="randomize" className="cursor-pointer text-foreground">
              Randomize
            </Label>
          </div>

          <div
            className={`flex items-center gap-2 ${randomizePerItem ? "opacity-60" : ""}`}
          >
            <Checkbox
              id="numbers"
              checked={includeNumbers}
              onCheckedChange={handleIncludeNumbersChange}
              disabled={randomizePerItem}
            />
            <Label
              htmlFor="numbers"
              className={`text-foreground ${randomizePerItem ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              Numbers
            </Label>
          </div>

          <div
            className={`flex items-center gap-2 ${randomizePerItem ? "opacity-60" : ""}`}
          >
            <Checkbox
              id="capitalize"
              checked={capitalize}
              onCheckedChange={handleCapitalizeChange}
              disabled={randomizePerItem}
            />
            <Label
              htmlFor="capitalize"
              className={`text-foreground ${randomizePerItem ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              Capitalize
            </Label>
          </div>

          <div
            className={`flex items-center gap-2 ${randomizePerItem ? "opacity-60" : ""}`}
          >
            <Checkbox
              id="separators"
              checked={useSeparators}
              onCheckedChange={handleUseSeparatorsChange}
              disabled={randomizePerItem}
            />
            <Label
              htmlFor="separators"
              className={`text-foreground ${randomizePerItem ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              Separators
            </Label>
          </div>

          {useSeparators && (
            <Select
              value={separatorType}
              onValueChange={handleSeparatorTypeChange}
              disabled={randomizePerItem}
            >
              <SelectTrigger className="w-auto" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dash">Dash</SelectItem>
                <SelectItem value="underscore">Underscore</SelectItem>
                <SelectItem value="random">Random</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </PageToolbar>

      <div className="pt-4 space-y-8">
        {Object.keys(sectionLabels).map((section) => (
          <div key={section} className="mb-6">
            <h3 className="text-lg font-medium text-foreground mb-3">
              {sectionLabels[section]}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedUsernames[section]?.map(
                ([key, { components, entropy }]) => {
                  const opt = getEffectiveOptions(key);
                  return (
                    <CopyableItem
                      key={key}
                      content={getDisplayUsername(components, key)}
                      label={key}
                      infoBits={entropy}
                      copyToClipboard={copyToClipboard}
                      copiedId={copiedBits}
                      itemId={key}
                      generationCount={generationCount}
                      renderContentOnly={false}
                      showLabel={false}
                      noMarginBottom={true}
                      hideCopyTextBelowLg={true}
                      className="max-w-md"
                    >
                      <div
                        className={`flex flex-wrap ${opt.useSeparators ? "" : "gap-1"}`}
                      >
                        {renderUsernameContent(components, key)}
                      </div>
                    </CopyableItem>
                  );
                }
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function UsernamePage() {
  return (
    <div className="container p-4">
      <h2 className="text-2xl font-heading font-bold mb-4">
        Random Username Generator
      </h2>
      <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
        <UsernameDisplay />
      </Suspense>
    </div>
  );
}
