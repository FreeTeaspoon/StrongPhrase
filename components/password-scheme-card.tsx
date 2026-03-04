"use client";

import { RiShieldKeyholeLine } from "react-icons/ri";
import { HiOutlineChatBubbleOvalLeftEllipsis } from "react-icons/hi2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PasswordSchemeCard() {
  return (
    <Card className="mt-20 flex-col md:flex-row overflow-hidden">
      <div className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-lg">
            <HiOutlineChatBubbleOvalLeftEllipsis className="text-3xl" />
            Use a <u>passphrase</u> for...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Use randomly-generated pass
            <strong className="italic">phrase</strong> for each of your most
            important accounts that you type often:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your master password for your password manager</li>
            <li>Laptop</li>
            <li>Google / Apple account</li>
            <li>Wi-fi</li>
          </ul>

          <p className="font-bold">Examples:</p>
          <ul className="space-y-1">
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                harsh robin finds orange jalapeno
              </code>
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                amateur dog and unruly pony steal icy sock
              </code>
            </li>
          </ul>
        </CardContent>
      </div>

      <div className="border-b md:border-b-0 md:border-r border-border" />

      <div className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-lg">
            <RiShieldKeyholeLine className="text-3xl" />
            And a <u>password manager</u> for...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Use a <strong>password manager</strong> with{" "}
            <strong>unique, randomly-generated</strong> passwords for everything
            else. It will generate random passwords for each website and
            automatically fill them for you each time you log-in, so you
            don&apos;t have to type them. (We suggest{" "}
            <a
              href="https://1password.com/"
              className="underline hover:text-primary"
              target="_blank"
              rel="noreferrer"
            >
              1Password
            </a>
            ,{" "}
            <a
              href="https://bitwarden.com/"
              className="underline hover:text-primary"
              target="_blank"
              rel="noreferrer"
            >
              Bitwarden
            </a>
            , or{" "}
            <a
              href="https://proton.me/pass"
              className="underline hover:text-primary"
              target="_blank"
              rel="noreferrer"
            >
              Proton Pass
            </a>
            ). Turn on 2-factor authentication on your most important accounts
            (email, bank, etc.).
          </p>

          <p className="font-bold">Examples:</p>
          <ul className="space-y-1">
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                7ZuNburjjGmme-MDuE*
              </code>
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                3@Y@qXWb@LKnd7qCfsd
              </code>
            </li>
          </ul>
        </CardContent>
        <CardFooter className="flex-wrap gap-2 justify-end">
          <Button variant="secondary" asChild>
            <a
              href="https://1password.com"
              target="_blank"
              rel="noreferrer"
            >
              Get 1Password
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <a
              href="https://bitwarden.com"
              target="_blank"
              rel="noreferrer"
            >
              Get Bitwarden
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <a
              href="https://proton.me/pass"
              target="_blank"
              rel="noreferrer"
            >
              Get Proton Pass
            </a>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
