"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const hardwareOptions: Record<string, Record<string, number>> & {
  all: Record<string, number>;
} = {
  passcode: {
    "iOS maximum crack rate": 12.5,
    "Android maximum crack rate": 40,
    "iOS Cellebrite observed crack rate (2025, iPhone SE)": 0.036,
  },
  passphrase: {
    "Standard consumer hardware": 184000,
    "Best consumer hardware": 2.6e6,
    "Nation state (NSA, etc.)": 1.9e12,
    "Far future nation state": 1e15,
  },
  get all() {
    const prefixedPasscode = Object.entries(this.passcode).reduce(
      (acc, [key, value]: [string, number]) => {
        acc[`Phone only: ${key}`] = value;
        return acc;
      },
      {} as Record<string, number>
    );
    return {
      ...prefixedPasscode,
      ...this.passphrase,
    };
  },
};

export const defaultHashRates: Record<string, number> = {
  passcode: Object.values(hardwareOptions.passcode)[0],
  passphrase: Object.values(hardwareOptions.passphrase)[1],
  all: Object.values(hardwareOptions.passphrase)[1],
};

function formatGuessRate(value: number): string {
  if (value >= 1e15) {
    return `${(value / 1e15).toFixed(0)} quadrillion guesses/sec`;
  } else if (value >= 1e12) {
    return `${(value / 1e12).toFixed(0)} trillion guesses/sec`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(0)} million guesses/sec`;
  }
  return `${value.toLocaleString()} guesses/sec`;
}

interface HashRateSelectorProps {
  hashRate: number;
  setHashRate: (rate: number) => void;
  mode?: string;
}

export default function HashRateSelector({
  hashRate,
  setHashRate,
  mode = "passphrase",
}: HashRateSelectorProps) {
  const options = hardwareOptions[mode] ?? hardwareOptions.passphrase;

  return (
    <div className="space-y-1.5">
      <Label>Select attacker computing power:</Label>
      <Select
        value={String(hashRate)}
        onValueChange={(val) => setHashRate(Number(val))}
      >
        <SelectTrigger className="w-auto max-w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(options).map(([key, value]) => (
            <SelectItem key={value} value={String(value)}>
              {key} [{formatGuessRate(value)}]
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
