"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  timeToCrackAvg,
  convertTimeToReadableFormat,
} from "@/lib/passphrase-utils";
import { getPasscodeAndEntropy } from "@/lib/passcode-utils";
import { filteredPasscodes } from "@/lib/filtered-passcodes-six";
import HashRateSelector, {
  defaultHashRates,
  hardwareOptions,
} from "@/components/hash-rate-selector";
import CopyableItem from "@/components/copyable-item";
import PageToolbar from "@/components/page-toolbar";
import FAQItem from "@/components/faq-item";
import MarkdownCustom from "@/components/markdown-custom";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* -------------------------------------------------------------------------- */
/*  PasscodeDisplay                                                           */
/* -------------------------------------------------------------------------- */

interface PasscodeData {
  passcode: string;
  entropy: number;
}

function PasscodeDisplay() {
  const [passcodes, setPasscodes] = useState<Record<string, PasscodeData>>({});
  const [copiedBits, setCopiedBits] = useState<string | null>(null);
  const [hashRate, setHashRate] = useState(defaultHashRates.passcode);
  const [generationCount, setGenerationCount] = useState(0);

  const generatePasscodes = useCallback(() => {
    const passcodeData: Record<string, PasscodeData> = {
      "6 digits": getPasscodeAndEntropy(6),
      "8 digits": getPasscodeAndEntropy(8),
      "10 Digits (Strongest)": getPasscodeAndEntropy(10),
    };

    setCopiedBits(null);
    setPasscodes(passcodeData);
    setGenerationCount((c) => c + 1);
  }, []);

  const crackTimes = useMemo(() => {
    return Object.entries(passcodes).map(([key, { entropy }]) => ({
      key,
      entropy: Math.round(entropy),
      label: key,
      time: convertTimeToReadableFormat(timeToCrackAvg(entropy, hashRate)),
    }));
  }, [passcodes, hashRate]);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBits(null);
    setTimeout(() => {
      setCopiedBits(id);
    }, 10);
  }, []);

  useEffect(() => {
    generatePasscodes();
  }, [generatePasscodes]);

  return (
    <section>
      <PageToolbar
        onGenerate={generatePasscodes}
        generateButtonText="New passcodes!"
      >
        <HashRateSelector
          setHashRate={setHashRate}
          hashRate={hashRate}
          mode="passcode"
        />
      </PageToolbar>

      {crackTimes.map(({ key, label, entropy, time }) => (
        <CopyableItem
          key={key}
          content={passcodes[key]?.passcode}
          label={label}
          stats={[{ label: "to crack (avg)", value: time }]}
          infoBits={entropy}
          copyToClipboard={copyToClipboard}
          copiedId={copiedBits}
          itemId={key}
          generationCount={generationCount}
          className={`max-w-md ${key === "10 Digits (Strongest)" ? "ring-1 ring-primary/20" : ""}`}
        />
      ))}

      <PasscodeFAQ hashRate={hashRate} />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  PasscodeCrackTable                                                        */
/* -------------------------------------------------------------------------- */

const formatNumber = (number: number, precision = 3) => {
  const rounded = Number(number.toPrecision(precision));
  return rounded.toLocaleString();
};

const isTimeFourYearsOrGreater = (timeInSeconds: number) => {
  const secondsInYear = 60 * 60 * 24 * 365;
  const years = timeInSeconds / secondsInYear;
  return years >= 3.8;
};

function PasscodeCrackTable({ hashRate }: { hashRate: number }) {
  const generateTableData = () => {
    const data = [];
    for (let length = 4; length <= 15; length += 1) {
      const numberOfGuesses = 10 ** length;
      const entropy = Math.log2(numberOfGuesses);
      const avgTime = timeToCrackAvg(entropy, hashRate);

      const iosMaxTime = timeToCrackAvg(
        entropy,
        hardwareOptions.passcode["iOS maximum crack rate"]
      );
      const androidMaxTime = timeToCrackAvg(
        entropy,
        hardwareOptions.passcode["Android maximum crack rate"]
      );
      const cellebriteTime = timeToCrackAvg(
        entropy,
        hardwareOptions.passcode[
          "iOS Cellebrite observed crack rate (2025, iPhone SE)"
        ]
      );

      data.push({
        length,
        entropy: formatNumber(entropy, 2),
        avgtime: convertTimeToReadableFormat(avgTime),
        iosMaxTime: convertTimeToReadableFormat(iosMaxTime),
        androidMaxTime: convertTimeToReadableFormat(androidMaxTime),
        cellebriteTime: convertTimeToReadableFormat(cellebriteTime),
        iosMaxTimeGreen: isTimeFourYearsOrGreater(iosMaxTime),
        androidMaxTimeGreen: isTimeFourYearsOrGreater(androidMaxTime),
        cellebriteTimeGreen: isTimeFourYearsOrGreater(cellebriteTime),
      });
    }
    return data;
  };

  const tableData = generateTableData();

  const thStyle = "break-words whitespace-normal max-w-[200px]";

  return (
    <section className="overflow-x-auto">
      <div className="text-sm text-green-600 mb-2">
        <strong>Green = Average time to crack is 4 years or greater</strong>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={thStyle}># of digits in passcode</TableHead>
            <TableHead className={thStyle}>Bits of entropy</TableHead>
            <TableHead className={thStyle}>
              iOS avg time to crack (12.5/sec) (
              <a
                href="https://support.apple.com/en-gb/guide/security/sec20230a10d/web#sec92064f801"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                source
              </a>
              )
            </TableHead>
            <TableHead className={thStyle}>
              Android avg time to crack (40/sec) (
              <a
                href="https://source.android.com/docs/security/features/encryption/file-based#key-storage-and-protection"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                source
              </a>
              )
            </TableHead>
            <TableHead className={thStyle}>
              iOS Cellebrite Observed avg time to crack (0.036/sec) (
              <a
                href="https://www.linkedin.com/feed/update/urn:li:activity:7286210249928105984/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                source
              </a>
              )
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow
              key={row.length}
              className={index % 2 === 0 ? "bg-muted/50" : ""}
            >
              <TableCell className="font-bold">{row.length} digits</TableCell>
              <TableCell>{row.entropy} bits</TableCell>
              <TableCell>
                <strong
                  className={row.iosMaxTimeGreen ? "text-green-600" : ""}
                >
                  {row.iosMaxTime}
                </strong>
              </TableCell>
              <TableCell>
                <strong
                  className={row.androidMaxTimeGreen ? "text-green-600" : ""}
                >
                  {row.androidMaxTime}
                </strong>
              </TableCell>
              <TableCell>
                <strong
                  className={row.cellebriteTimeGreen ? "text-green-600" : ""}
                >
                  {row.cellebriteTime}
                </strong>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  PasscodeChecker                                                           */
/* -------------------------------------------------------------------------- */

function PasscodeChecker() {
  const [userPasscode, setUserPasscode] = useState("");
  const [isValidInput, setIsValidInput] = useState(true);

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserPasscode(value);
    setIsValidInput(/^\d{0,15}$/.test(value));
  };

  const analysis = useMemo(() => {
    if (!userPasscode || !isValidInput) {
      return null;
    }

    const numDigits = userPasscode.length;
    const isInFilteredList =
      numDigits === 6 && filteredPasscodes.includes(userPasscode);

    let attemptsNeeded;
    if (isInFilteredList) {
      const position = filteredPasscodes.indexOf(userPasscode) + 1;
      attemptsNeeded = position;
    } else {
      let totalPossiblePasscodes = 10 ** numDigits;
      if (numDigits === 6) {
        totalPossiblePasscodes -= filteredPasscodes.length;
      }
      const entropy = Math.log2(totalPossiblePasscodes);
      attemptsNeeded = Math.pow(2, entropy - 1);
    }

    const crackTimes = Object.entries(hardwareOptions.passcode).map(
      ([scenario, rate]) => {
        const timeInSeconds = attemptsNeeded / rate;
        const time =
          numDigits < 6
            ? "less than a second"
            : convertTimeToReadableFormat(timeInSeconds);
        return { scenario, hashRate: rate, time };
      }
    );

    return {
      numDigits,
      isInFilteredList,
      attemptsNeeded,
      crackTimes,
    };
  }, [userPasscode, isValidInput]);

  const isWeak = analysis?.isInFilteredList || (analysis && analysis.numDigits < 6);

  return (
    <div className="max-w-xl mx-auto mt-4">
      <div
        className={`rounded-2xl shadow-sm border p-6 ${
          !analysis
            ? "bg-muted/30 border-border"
            : isWeak
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              : "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
        }`}
      >
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <h3 className="text-left mb-2 font-semibold">
                Enter your current passcode
              </h3>
              <Input
                id="passcode-input"
                type="text"
                value={userPasscode}
                onChange={handlePasscodeChange}
                placeholder="123456"
                className={`text-xl font-light tracking-wider ${
                  !isValidInput ? "border-destructive" : ""
                }`}
                maxLength={15}
              />
              {!isValidInput && (
                <p className="text-destructive text-xs mt-1">
                  Digits only (0-9)
                </p>
              )}
            </div>
          </div>
        </div>

        {!analysis ? (
          <div className="text-left">
            <p className="text-muted-foreground text-sm text-center leading-relaxed">
              Your passcode is never sent off your device. To be safer, use a
              passcode similar to yours instead of your real one.
            </p>
          </div>
        ) : (
          <div className="text-center">
            {isWeak ? (
              <>
                <div className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-2">
                  ❌ Your passcode is very easy-to-crack
                </div>
                <div className="text-sm text-red-700 dark:text-red-400 mb-4">
                  It would take the cops between{" "}
                  <strong>{analysis.crackTimes[0].time}</strong> and{" "}
                  <strong>{analysis.crackTimes[1].time}</strong> to crack this
                  passcode.
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold text-green-700 dark:text-green-400 mb-2">
                  ✅ Your passcode is not on our easy-to-crack list
                </div>
                <div className="text-sm text-green-700 dark:text-green-400 mb-4">
                  It would take the cops between{" "}
                  <strong>{analysis.crackTimes[0].time}</strong> and{" "}
                  <strong>{analysis.crackTimes[2].time}</strong> to crack this
                  passcode.
                </div>
              </>
            )}

            <div className="text-xs text-muted-foreground">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-1">iOS avg time to crack (12.5/sec):</td>
                    <td className="font-semibold py-1">
                      {analysis.crackTimes[0].time}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1">
                      Android avg time to crack (40/sec):
                    </td>
                    <td className="font-semibold py-1">
                      {analysis.crackTimes[1].time}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1">
                      iOS Cellebrite Observed avg time to crack (0.036/sec):
                    </td>
                    <td className="font-semibold py-1">
                      {analysis.crackTimes[2].time}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  PasscodeFAQ                                                               */
/* -------------------------------------------------------------------------- */

function PasscodeFAQ({ hashRate }: { hashRate: number }) {
  return (
    <div className="mt-16 space-y-16">
      <section id="FAQ">
        <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>

        <div className="space-y-10">
          <FAQItem
            question="Which one should I pick?"
            id="which-one"
            answer={`
              * **8 digits** — **Best balance for most people**: stronger than the default 6, but still quick to type.

              * **10 digits** — Strongest option, but takes longer to enter each time.

              * **6 digits** — A random 6-digit code is much better than one you choose yourself. Humans are bad at picking random numbers and often use patterns, birthdays, or sequences that attackers try first.
            `}
          />

          <div className="space-y-2" id="cracktime">
            <h2 className="text-xl font-semibold">
              How long does it take to crack a passcode?
            </h2>
            <div>
              <MarkdownCustom>
                {`See the table below. 
                
This system forces password/passcode checking to be done on the device, which means it can't be scaled up to dozens or hundreds of computers simultaneously guessing.`}
              </MarkdownCustom>
              <PasscodeCrackTable hashRate={hashRate} />
            </div>
          </div>

          <FAQItem
            question="How do we know the guesses/second?"
            id="guesses-per-second"
            answer={`
              The iOS documentation claims that each passcode attempt should take [at least 80 milliseconds](https://support.apple.com/en-gb/guide/security/sec20230a10d/web#sec92064f801), which equals **12.5 guesses/second**.

              The Android documentaiton says it targets [25 milliseconds per attempt](https://source.android.com/docs/security/features/encryption/file-based#key-storage-and-protection), which equals **40 guesses/second**.

              These rates assume that cracking tools can bypass the tools (Secure Enclave, etc.) that are used to protect the passcode. 
              
              In practice, the forensic tools that cops use (like [GrayKey and Cellebrite](https://sls.eff.org/technologies/forensic-extraction-tools)) are generally slower than the theoretical maximums listed in the iOS/Android documentation. A [2025 LinkedIn post from a cop](https://www.linkedin.com/feed/update/urn:li:activity:7286210249928105984/) incidates a crack rate of 2.2 attempts/minute (595,000 attampts over 192 days) or **0.036 guesses/second**.

              We use 12.5 guesses/second as the default crack rate in the drop-down above because it is a conservative middle-ground.

              You can adjust the crack rate using the dropdown menu at the top of this page.
            `}
          />

          <FAQItem
            question="What if the generator randomly gives me passcode that is easy to crack?"
            id="secure"
            answer={`
              For six-digit passcodes specifically, there are a number of commonly used passcodes. Birthdays are also very common.

              An attacker would likely try these common patterns first, and there is chance that the random passcode generator actually gives you one of these common passcodes. 

              To prevent this, we prevent the generator from giving you a 6-digit passcode that is either:
              * On a list of the top 10,000 commonly used[^rockyou] 6-digit codes: \`123456\` or \`555555\` or \`789456\`
              * Or fits a common birthday format[^bday] (MMDDYY, DDMMYY, YYMMDD).

              This helps the entropy of your passcode be more trustworthy. You can see the full list of about [94,000 filtered passcodes here](https://gitlab.com/strongphrase/strongphrase.net/blob/main/src/scripts/wordlists/filtered_passcodes_six.js).

              We only do this filtering for 6-digit passcodes. Removing 94k from 10^6 possible passcodes is a small fraction (9.4%) of the total, so you still have ~20 bits of entropy (19.93 bits normally, 19.79 bits after exclusions).

              iOS will attmpt to warn you if you're using a [certain set of easy to guess passcodes](https://this-pin-can-be-easily-guessed.github.io/), but it doesn't block you entirely from using them.

              [^rockyou]: Our list is derived from the [RockYou](https://en.wikipedia.org/wiki/RockYou) 2009 data breach that exposed 32 million passwords. These are sorted by how frequently they occurred in the leaked passwords. In our process, we filtered down to only 6-digit codes on that list. We then remove anything fitting our birthday formats (because we are going to re-add them separately). We then take the top 10,000.
              [^bday]: You can see this [heatmap for 4-digit pins](https://datagenetics.com/blog/september32012/index.html) for information on how birthdays and anniversaries are commonly used. 
            `}
          />

          <div className="space-y-2" id="checker">
            <h2 className="text-xl font-semibold">
              Check if your passcode is easy-to-crack
            </h2>
            <div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  This tool checks your passcode against our list of common
                  patterns and easily guessable combinations. The list includes
                  popular 6-digit codes from data breaches (like{" "}
                  <code>123456</code>, <code>555555</code>) and common birthday
                  formats (MMDDYY, DDMMYY, YYMMDD). You can view the complete
                  list of about 94,000 filtered passcodes in our{" "}
                  <a
                    href="https://gitlab.com/strongphrase/strongphrase.net/blob/main/src/scripts/wordlists/filtered_passcodes_six.js"
                    className="text-primary hover:underline"
                  >
                    repository
                  </a>
                  .
                </p>
              </div>
              <PasscodeChecker />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Passcode Page                                                             */
/* -------------------------------------------------------------------------- */

export default function PasscodePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Phone Passcode Generator</h2>
      <p className="text-muted-foreground text-sm mb-4">
        Keep pressing the button until you get one you like.
      </p>
      <PasscodeDisplay />
    </div>
  );
}
