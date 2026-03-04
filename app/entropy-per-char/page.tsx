"use client";

import { useState, useEffect } from "react";
import { getPassphrase, getAllGrammarLabels } from "@/lib/passphrase-utils";
import MarkdownCustom from "@/components/markdown-custom";
import { Button } from "@/components/ui/button";

export default function EntropyPerCharPage() {
  const [markdownContent, setMarkdownContent] = useState("");
  const [escapedMarkdownContent, setEscapedMarkdownContent] = useState("");
  const [jsonContent, setJsonContent] = useState("");
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    if (!showTable) return;

    const calculateEntropyPerChar = (passphrase: string, totalEntropy: number) => {
      return totalEntropy / passphrase.length;
    };

    const generatePassphraseStats = () => {
      const grammarLabels = getAllGrammarLabels();
      let markdown =
        "| Total Bits | Average Entropy/Char | Min Entropy/Char | Max Entropy/Char | Sample Passphrase |\n";
      markdown +=
        "|------------|---------------------|-------------------|-------------------|-------------------|\n";

      let totalAverageEntropy = 0;
      let totalMinEntropy = 0;
      let totalMaxEntropy = 0;
      let count = 0;

      const jsonDict: Record<string, Record<string, string>> = {};

      for (const [bits] of Object.entries(grammarLabels)) {
        const entropies: number[] = [];
        let samplePassphrase = "";
        for (let i = 0; i < 10000; i++) {
          const passphrase = getPassphrase(Number(bits));
          if (i === 0) samplePassphrase = passphrase;
          const entropyPerChar = calculateEntropyPerChar(
            passphrase,
            Number(bits)
          );
          entropies.push(entropyPerChar);
        }

        const totalEntropyPerChar = entropies.reduce(
          (sum, entropy) => sum + entropy,
          0
        );
        const average = totalEntropyPerChar / entropies.length;
        const min = Math.min(...entropies);
        const max = Math.max(...entropies);

        markdown += `| ${bits} | **${average.toFixed(2)}** | ${min.toFixed(2)} | ${max.toFixed(2)} | \`${samplePassphrase}\` |\n`;

        jsonDict[bits] = {
          avg: average.toFixed(2),
          min: min.toFixed(2),
          max: max.toFixed(2),
          sample: samplePassphrase,
        };

        totalAverageEntropy += average;
        totalMinEntropy += min;
        totalMaxEntropy += max;
        count++;
      }

      const averageEntropy = (totalAverageEntropy / count).toFixed(2);
      const averageMinEntropy = (totalMinEntropy / count).toFixed(2);
      const averageMaxEntropy = (totalMaxEntropy / count).toFixed(2);

      markdown += `| **Average** | **${averageEntropy}** | **${averageMinEntropy}** | **${averageMaxEntropy}** |  |\n`;

      jsonDict["Average"] = {
        avg: averageEntropy,
        min: averageMinEntropy,
        max: averageMaxEntropy,
      };

      return { markdown, jsonDict };
    };

    const { markdown, jsonDict } = generatePassphraseStats();
    setMarkdownContent(markdown);

    const escapedContent = markdown.replace(/`/g, "\\`");
    setEscapedMarkdownContent(escapedContent);

    setJsonContent(JSON.stringify(jsonDict, null, 2));
  }, [showTable]);

  return (
    <div className="container mx-auto p-4">
      {!showTable ? (
        <Button onClick={() => setShowTable(true)}>
          Show Entropy Per Character Table (loads very slow!)
        </Button>
      ) : (
        <>
          <h1 className="text-2xl font-bold tracking-tight mb-4">
            Entropy Per Character
          </h1>
          <div className="mb-6">
            <MarkdownCustom>{markdownContent}</MarkdownCustom>
          </div>
          <h2 className="text-xl font-semibold mb-2">
            Copy paste into the code to update
          </h2>
          <pre className="rounded-md border bg-muted p-4 overflow-x-auto text-sm mb-6">
            {escapedMarkdownContent}
          </pre>
          <h2 className="text-xl font-semibold mb-2">JSON Output</h2>
          <pre className="rounded-md border bg-muted p-4 overflow-x-auto text-sm">
            {jsonContent}
          </pre>
        </>
      )}
    </div>
  );
}
