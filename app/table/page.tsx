"use client";

import { useState } from "react";
import Link from "next/link";
import {
  convertTimeToReadableFormat,
  timeToCrackAvg,
  avgCostToCrack,
  formatDollarToScale,
} from "@/lib/passphrase-utils";
import HashRateSelector, {
  defaultHashRates,
} from "@/components/hash-rate-selector";
import PageToolbar from "@/components/page-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const costOptions: Record<string, number> = {
  "$0.001": 0.001,
  "$0.01": 0.01,
  "$0.25 (Best-case cloud scenario bcrypt)": 0.25,
  "$0.50 (Default)": 0.5,
  "$1.00": 1,
  "$6.00 (1Password scenario)": 6,
};
const defaultCostToCrack = 0.5;

function formatNumber(number: number) {
  const rounded = Number(number.toPrecision(3));
  return rounded.toLocaleString();
}

export default function CrackTimePage() {
  const [hashRate, setHashRate] = useState(defaultHashRates.passphrase);
  const [costPerGuess32, setCostPerGuess32] = useState(defaultCostToCrack);
  const [showAllSteps, setShowAllSteps] = useState(false);

  const generateTableData = () => {
    const data = [];
    const step = showAllSteps ? 1 : 5;
    for (let bits = 5; bits <= 100; bits += step) {
      const numberOfGuesses = 2 ** bits;
      const avgCost = avgCostToCrack(bits, costPerGuess32);
      const roundedCost = formatDollarToScale(avgCost, 2, false);
      const avgTime = timeToCrackAvg(bits, hashRate);
      const maxTime = avgTime * 2;
      data.push({
        bits,
        guesses: formatNumber(numberOfGuesses),
        avgtime: convertTimeToReadableFormat(avgTime),
        maxtime: convertTimeToReadableFormat(maxTime),
        cost: roundedCost.toLocaleString(),
      });
    }
    return data;
  };

  const tableData = generateTableData();

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold tracking-tight mb-4">
        Time and Cost to Crack
      </h2>

      <Card className="max-w-3xl bg-muted/50">
        <CardContent className="text-sm">
          <p>
            See the{" "}
            <Link href="/#FAQ" className="underline underline-offset-4 hover:text-primary">
              FAQ on the main page
            </Link>{" "}
            for more information on time to crack and cost to crack
            calculations.
          </p>
        </CardContent>
      </Card>

      <Card className="max-w-3xl mt-4 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
        <CardContent className="text-sm">
          <p>
            <strong>Takeaway:</strong> <u>45 bits</u> should be your minimum
            and most people don&apos;t need more than <u>65 bits</u>.
          </p>
        </CardContent>
      </Card>

      <PageToolbar generateButtonText="" isSticky hideButton>
        <div className="w-full flex flex-col gap-2">
          <div className="flex flex-row flex-wrap gap-3 items-end">
            <HashRateSelector
              setHashRate={setHashRate}
              hashRate={hashRate}
              mode="all"
            />

            <div className="space-y-1.5">
              <Label>$ Cost per 2^32 guesses:</Label>
              <Select
                value={String(costPerGuess32)}
                onValueChange={(val) => setCostPerGuess32(Number(val))}
              >
                <SelectTrigger className="w-auto max-w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(costOptions).map(([label, value]) => (
                    <SelectItem key={value} value={String(value)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllSteps(!showAllSteps)}
            >
              {showAllSteps
                ? "Show every 5 steps"
                : "Show all entropy steps"}
            </Button>
          </div>
        </div>
      </PageToolbar>

      <div className="mt-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bits of Entropy</TableHead>
              <TableHead>Pool of possible guesses</TableHead>
              <TableHead>Max Crack Time (double)</TableHead>
              <TableHead>Avg. Crack Time</TableHead>
              <TableHead>Avg cost to crack</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.bits}>
                <TableCell className="font-bold">{row.bits} bits</TableCell>
                <TableCell>{row.guesses}</TableCell>
                <TableCell>
                  <em>{row.maxtime}</em>
                </TableCell>
                <TableCell>
                  <strong>{row.avgtime}</strong>
                </TableCell>
                <TableCell>
                  <strong>{row.cost}</strong>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
