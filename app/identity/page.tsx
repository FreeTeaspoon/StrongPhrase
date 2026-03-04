"use client";

import { useState, useCallback, useEffect, useRef, cloneElement } from "react";
import type { ReactElement } from "react";
import {
  generateIdentities,
  disposableEmailProviders,
} from "@/lib/identity-utils";
import { avatarProviders } from "@/lib/avatar-utils";
import ToolbarStorage from "@/lib/storage";
import AvatarDownloadOverlay, {
  useAvatarDownload,
} from "@/lib/avatar-download";
import { cn } from "@/lib/utils";
import PageToolbar from "@/components/page-toolbar";
import FAQItem from "@/components/faq-item";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FaRegCopy,
  FaCheck,
  FaChevronRight,
  FaInfoCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaAt,
  FaShieldAlt,
} from "react-icons/fa";
import { Si1Password } from "react-icons/si";
import { ClipboardCheck } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface IdentityName {
  firstName: string;
  lastName: string;
  full: string;
  sex: string;
}

interface IdentityAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  full: string;
}

interface IdentityAvatar {
  url: string;
  type: string;
  label: string;
}

interface DisposableEmail {
  email: string;
  username: string;
  domain: string;
  provider: string;
  label: string;
  inboxUrl: string;
}

interface Identity {
  name: IdentityName;
  phone: string;
  address: IdentityAddress;
  avatar: IdentityAvatar;
  passphrase: string;
  gradient: string[];
  birthday: string;
  username: string;
  disposableEmail: DisposableEmail;
  id: string;
  sex: string;
}

/* ------------------------------------------------------------------ */
/*  1Password Save Dialog Content                                      */
/* ------------------------------------------------------------------ */

function OnePasswordDialogContent({
  identity,
  formatIdentityForCopy,
}: {
  identity: Identity;
  formatIdentityForCopy: () => string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatIdentityForCopy());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Save Identity to 1Password</DialogTitle>
        <DialogDescription>
          Save this generated identity to your 1Password vault for future use.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="rounded-lg border p-4 space-y-1.5">
          <p className="text-sm font-medium">{identity.name.full}</p>
          <p className="text-xs text-muted-foreground">
            {identity.disposableEmail.email}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {identity.passphrase}
          </p>
        </div>

        <Button
          onClick={handleCopy}
          className="w-full"
          variant={copied ? "secondary" : "default"}
        >
          {copied ? (
            <>
              <ClipboardCheck className="size-4" />
              Copied to Clipboard!
            </>
          ) : (
            <>
              <Si1Password className="size-4" />
              Save to 1Password &mdash; Copy to Clipboard
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Copy the full identity and paste it into a new 1Password login entry.
          If you have the 1Password browser extension, it can auto-fill from
          saved items.
        </p>
      </div>

      <DialogFooter showCloseButton />
    </DialogContent>
  );
}

/* ------------------------------------------------------------------ */
/*  Identity Card                                                      */
/* ------------------------------------------------------------------ */

function IdentityCard({
  identity,
  onCopy,
  copiedField,
}: {
  identity: Identity;
  onCopy: (text: string, type: string, cardId: string) => void;
  copiedField: string | null;
}) {
  const {
    name,
    phone,
    address,
    avatar,
    gradient,
    id,
    birthday,
    username,
    disposableEmail,
    passphrase,
  } = identity;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const { downloadStatus, handleImageDownload } = useAvatarDownload(
    avatar,
    name,
  );

  /* ---- sub-components (closure over card state) ---- */

  const CopyButton = ({
    text,
    type,
    white = false,
    className: btnClassName = "",
    icon = <FaRegCopy /> as ReactElement,
    size = "small" as "small" | "large",
    tooltip = null as string | null,
    tooltipPosition = "bottom" as
      | "bottom"
      | "bottom-left"
      | "right"
      | "left"
      | "top"
      | "top-right",
  }) => {
    const iconSize = size === "small" ? "w-3.5 h-3.5" : "w-5 h-5";

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCopy(text, type, id);
        }}
        className={cn(
          "p-1 rounded-full transition-colors flex items-center justify-center relative group/copy cursor-pointer",
          size !== "small" && "p-2",
          white ? "hover:bg-white/20" : "hover:bg-muted",
          btnClassName,
        )}
        title={tooltip ? undefined : "Copy to clipboard"}
      >
        {copiedField === type ? (
          <FaCheck
            className={cn(iconSize, white ? "text-white" : "text-green-600")}
          />
        ) : (
          cloneElement(icon as ReactElement<{ className?: string }>, {
            className: cn(
              iconSize,
              white ? "text-white/70" : "text-muted-foreground",
            ),
          })
        )}

        {tooltip && (
          <span
            className={cn(
              "absolute px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/copy:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10",
              tooltipPosition === "right" &&
                "left-full ml-2 top-1/2 -translate-y-1/2",
              tooltipPosition === "bottom" &&
                "top-full mt-2 left-1/2 -translate-x-1/2",
              tooltipPosition === "bottom-left" && "top-full mt-2 left-0",
              tooltipPosition === "left" &&
                "right-full mr-2 top-1/2 -translate-y-1/2",
              tooltipPosition === "top" &&
                "bottom-full mb-2 left-1/2 -translate-x-1/2",
              tooltipPosition === "top-right" && "bottom-full mb-2 right-0",
            )}
          >
            {tooltip}
          </span>
        )}
      </button>
    );
  };

  const InfoTooltip = ({ text }: { text: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex ml-2 cursor-help">
          <FaInfoCircle className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[220px]" side="top">
        {text}
      </TooltipContent>
    </Tooltip>
  );

  const InfoRow = ({
    content,
    type,
    className: rowClassName = "",
    isName = false,
    white = false,
    label = "",
    children: rowChildren = null as React.ReactNode,
    icon = null as ReactElement | null,
  }) => {
    const rowContent = (
      <div
        onClick={() => onCopy(content, type, id)}
        className={cn(
          "flex items-center py-1.5 px-2 cursor-pointer rounded -mx-2 group/row relative",
          !white && "hover:bg-muted",
          isName ? "justify-start" : "justify-between",
          rowClassName,
        )}
      >
        <div className="flex items-start">
          {!isName && icon && (
            <span
              className={cn(
                "text-muted-foreground/50 mr-2 w-4 flex-shrink-0",
                type === "passphrase" && "mt-1",
              )}
            >
              {icon}
            </span>
          )}
          <span
            className={cn(
              isName ? "text-2xl font-semibold" : "text-sm",
              white ? "text-white" : "text-foreground",
            )}
          >
            {content}
          </span>
        </div>
        <CopyButton
          className={isName ? "!ml-2" : "!ml-4"}
          text={content}
          type={type}
          white={white}
        />
      </div>
    );

    return (
      <>
        {label ? (
          <Tooltip>
            <TooltipTrigger asChild>{rowContent}</TooltipTrigger>
            <TooltipContent side="top" align="start">
              {label}
            </TooltipContent>
          </Tooltip>
        ) : (
          rowContent
        )}
        {rowChildren}
      </>
    );
  };

  const formatIdentityForCopy = () =>
    `Name: ${name.full}
Email: ${disposableEmail.email}
Disposable Email Inbox: ${disposableEmail.inboxUrl}
Username: ${username}
Passphrase: ${passphrase}
Phone: ${phone}
Address: ${address.full}
Birthday: ${birthday}`;

  return (
    <div className="bg-card rounded-xl shadow-md overflow-hidden border">
      {/* Banner + Avatar */}
      <div>
        <div
          className={cn(
            "h-12 md:h-20 lg:h-24 relative",
            gradient[1],
            gradient[0],
          )}
        >
          {/* Copy-all & 1Password buttons */}
          <div className="absolute top-2 left-2 md:left-4 md:top-4 flex items-center gap-2">
            <CopyButton
              text={formatIdentityForCopy()}
              type="fullIdentity"
              white
              size="large"
              icon={<FaRegCopy />}
              className="bg-white/10 backdrop-blur-sm"
              tooltip="Copy identity to clipboard"
              tooltipPosition="bottom-left"
            />

            <Dialog>
              <DialogTrigger asChild>
                <button className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white relative group/op flex items-center justify-center cursor-pointer">
                  <Si1Password className="w-5 h-5" />
                  <span className="absolute px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/op:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 top-full mt-2 left-0">
                    Save to 1Password
                  </span>
                </button>
              </DialogTrigger>
              <OnePasswordDialogContent
                identity={identity}
                formatIdentityForCopy={formatIdentityForCopy}
              />
            </Dialog>
          </div>
        </div>

        {/* Avatar row */}
        <div className="px-6 -mt-8 md:-mt-12 lg:-mt-14 flex justify-between items-start">
          <div className="flex-1 pr-4 mt-16 md:mt-16 lg:mt-20">
            <InfoRow
              content={name.full}
              type="name"
              className="!p-0 !-mx-0"
              isName
            />
          </div>

          <div className="relative group">
            <div
              className={cn(
                "w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-background shadow-lg flex-shrink-0",
                "relative overflow-hidden",
                !imageLoaded && "animate-pulse bg-muted",
              )}
            >
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-muted-foreground/20" />
                </div>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={avatar.url}
                alt={name.full}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
                className={cn(
                  "w-full h-full object-cover transition-all duration-500 bg-background",
                  avatar.url.includes("dicebear") && "bg-background p-1",
                  imageLoaded ? "opacity-100" : "opacity-0",
                )}
              />

              {imageError && (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
              )}
            </div>

            <AvatarDownloadOverlay
              downloadStatus={downloadStatus}
              handleImageDownload={handleImageDownload}
            />
          </div>
        </div>
      </div>

      {/* Info fields */}
      <div className="px-6 pb-5 overflow-visible">
        <div className="mt-2 overflow-visible">
          <InfoRow
            content={disposableEmail.email}
            type="disposableEmail"
            label="Disposable Email"
            icon={<FaEnvelope />}
          >
            <div className="flex items-center">
              <a
                href={disposableEmail.inboxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-10 py-1 px-2 -mx-2 flex items-start text-xs text-muted-foreground hover:text-blue-600 transition-colors relative group"
              >
                <FaChevronRight className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 text-muted-foreground/60" />
                <span>View Mailbox on {disposableEmail.label}</span>
              </a>
              <InfoTooltip text="This is a temporary inbox where you can receive emails. The inbox is public and emails are automatically deleted after 1-3 days depending on the provider." />
            </div>
          </InfoRow>

          <InfoRow
            content={username}
            type="username"
            label="Username"
            icon={<FaAt />}
          />
          <InfoRow
            content={passphrase}
            type="passphrase"
            label="Passphrase"
            icon={<FaShieldAlt />}
            className="font-mono text-sm"
          />
          <InfoRow
            content={phone}
            type="phone"
            label="Phone"
            icon={<FaPhone />}
          />
          <InfoRow
            content={address.full}
            type="address"
            label="Address"
            icon={<FaMapMarkerAlt />}
          />
          <InfoRow
            content={birthday}
            type="birthday"
            label="Birthday"
            icon={<FaBirthdayCake />}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Identity Display (toolbar + grid of cards)                         */
/* ------------------------------------------------------------------ */

function IdentityDisplay() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [copiedStates, setCopiedStates] = useState<
    Record<string, string | null>
  >({});

  const [genderPreference, setGenderPreference] = useState<string | null>(
    () => ToolbarStorage.getGenderPreference(null) as string | null,
  );

  const [enabledProviders, setEnabledProviders] = useState<
    Record<string, boolean>
  >(() => {
    const defaults: Record<string, boolean> = {
      realistic: true,
      avataaars: true,
      randomuser: true,
      notionists: true,
      identicon: true,
      personas: true,
      avataaarsNeutral: true,
      uiAvatars: true,
      shapes: true,
    };
    return ToolbarStorage.getAvatarProviders(defaults) as Record<
      string,
      boolean
    >;
  });

  const [enabledEmailProviders, setEnabledEmailProviders] = useState<
    Record<string, boolean>
  >(() => {
    const defaults: Record<string, boolean> = {
      reusable: true,
      maildrop: false,
      inboxkitten: false,
    };
    const stored = ToolbarStorage.getEmailProviders(defaults) as Record<
      string,
      boolean
    >;
    return Object.fromEntries(
      Object.entries(stored).filter(([key]) => key in disposableEmailProviders),
    );
  });

  const sampleIdentity = { full: "John Smith", sex: "male" };

  const generateNewIdentities = useCallback(async () => {
    const result = await generateIdentities(
      4,
      enabledProviders,
      genderPreference,
      enabledEmailProviders,
    );
    setIdentities(result as unknown as Identity[]);
    setCopiedStates({});
  }, [enabledProviders, genderPreference, enabledEmailProviders]);

  const copyToClipboard = useCallback(
    (text: string, type: string, cardId: string) => {
      navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [cardId]: type }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [cardId]: null }));
      }, 2000);
    },
    [],
  );

  useEffect(() => {
    generateNewIdentities();
  }, [generateNewIdentities]);

  /* ---- avatar provider helpers ---- */

  const handleProviderToggle = (provider: string) => {
    setEnabledProviders((prev) => {
      const wouldAllBeDisabled =
        Object.entries(prev)
          .filter(([key]) => key !== provider)
          .every(([, enabled]) => !enabled) && prev[provider];

      if (wouldAllBeDisabled) return prev;

      const next = { ...prev, [provider]: !prev[provider] };
      ToolbarStorage.setAvatarProviders(next);
      return next;
    });
  };

  const handleSelectOnlyProvider = (provider: string) => {
    const next = Object.keys(enabledProviders).reduce(
      (acc, key) => {
        acc[key] = key === provider;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    ToolbarStorage.setAvatarProviders(next);
    setEnabledProviders(next);
  };

  /* ---- email provider helpers ---- */

  const handleEmailProviderToggle = (provider: string) => {
    setEnabledEmailProviders((prev) => {
      const wouldAllBeDisabled =
        Object.entries(prev)
          .filter(([key]) => key !== provider)
          .every(([, enabled]) => !enabled) && prev[provider];

      if (wouldAllBeDisabled) return prev;

      const next = { ...prev, [provider]: !prev[provider] };
      ToolbarStorage.setEmailProviders(next);
      return next;
    });
  };

  return (
    <section className="overflow-visible">
      <PageToolbar
        onGenerate={generateNewIdentities}
        generateButtonText="More"
        className="items-center"
        isSticky
      >
        {/* Gender preference */}
        <Select
          value={genderPreference || "random"}
          onValueChange={(value) => {
            const v = value === "random" ? null : value;
            setGenderPreference(v);
            ToolbarStorage.setGenderPreference(v ?? "");
          }}
        >
          <SelectTrigger className="w-full md:w-[150px]" size="sm">
            <SelectValue placeholder="Pick Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="random">Random Gender</SelectItem>
            <SelectItem value="male">Man</SelectItem>
            <SelectItem value="female">Woman</SelectItem>
          </SelectContent>
        </Select>

        {/* Avatar types dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full md:w-auto">
              Avatar Types
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[280px]" align="start">
            <div className="px-2 py-1.5">
              <Button
                size="xs"
                className="w-full"
                onClick={() => {
                  const allEnabled = Object.keys(enabledProviders).reduce(
                    (acc, key) => {
                      acc[key] = true;
                      return acc;
                    },
                    {} as Record<string, boolean>,
                  );
                  ToolbarStorage.setAvatarProviders(allEnabled);
                  setEnabledProviders(allEnabled);
                }}
              >
                Enable All
              </Button>
            </div>
            <DropdownMenuSeparator />
            {Object.entries(avatarProviders).map(([key, provider]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={enabledProviders[key]}
                onCheckedChange={() => handleProviderToggle(key)}
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-3 w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={provider.generate(sampleIdentity)}
                    alt={provider.label}
                    className="w-8 h-8 rounded-full bg-background object-cover flex-shrink-0"
                  />
                  <span className="text-sm">{provider.label}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOnlyProvider(key);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                    className="ml-auto text-xs opacity-40 hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded hover:bg-muted"
                    title="Enable only this avatar type"
                  >
                    only
                  </button>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Email providers dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full md:w-auto">
              Email Providers
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[280px]" align="start">
            <div className="px-2 py-1.5">
              <Button
                size="xs"
                className="w-full"
                onClick={() => {
                  const allEnabled = Object.keys(enabledEmailProviders).reduce(
                    (acc, key) => {
                      acc[key] = true;
                      return acc;
                    },
                    {} as Record<string, boolean>,
                  );
                  ToolbarStorage.setEmailProviders(allEnabled);
                  setEnabledEmailProviders(allEnabled);
                }}
              >
                Enable All
              </Button>
            </div>
            <DropdownMenuSeparator />
            {Object.entries(disposableEmailProviders).map(
              ([key, provider]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={enabledEmailProviders[key]}
                  onCheckedChange={() => handleEmailProviderToggle(key)}
                  onSelect={(e) => e.preventDefault()}
                >
                  <span className="text-sm">{provider.label}</span>
                </DropdownMenuCheckboxItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </PageToolbar>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 overflow-visible">
        {identities.map((identity) => (
          <IdentityCard
            key={identity.id}
            identity={identity}
            onCopy={copyToClipboard}
            copiedField={copiedStates[identity.id]}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Identity FAQ                                                       */
/* ------------------------------------------------------------------ */

function IdentityFAQ() {
  return (
    <section className="space-y-8" id="FAQ">
      <h2 className="text-2xl font-heading font-bold">
        Frequently Asked Questions
      </h2>

      <div className="space-y-8">
        <FAQItem
          question="Why would I use a randomly generated identity?"
          id="why-use"
          answer={`
Using randomly generated identity elements helps prevent doxxing and keeps your accounts separate:

* **Different Usernames and Display Names**: Makes it harder for someone to find you online and connect your different accounts. If you use "JaySmith" everywhere, anyone could Google that username and connect your Twitter, Facebook, Reddit, Spotify, GoodReads, Pinterest, etc., developing a clear picture of your habits, interests, location, and more.

* **Disposable Email Addresses**: Perfect for services you never want to hear from again but need for email verification.

* **Random Addresses**: Useful whenever you're asked for an address, especially when using unique credit cards for each purchase through services like [Privacy.com](https://privacy.com), which allow you to enter any name and address for purchases.

* **Passphrases**: Create strong, memorable passwords that are unique for each service, reducing the risk of credential stuffing attacks if one service is compromised.

* **Avatar Images**: Using different profile pictures across services makes visual correlation of your accounts more difficult.
          `}
        />

        <FAQItem
          question="Is it safe to use a disposable email service?"
          id="disposable-email-safety"
          answer={`
Disposable email services provide a temporary inbox where you can receive emails. The inbox is public and emails are automatically deleted after 1-3 days depending on the provider.

**WARNING**: Do not use these for sensitive accounts as anyone could trigger a password reset and access your account. For private anonymous email aliases, consider [DuckDuckGo Email](https://duckduckgo.com/email), [Addy.io](https://addy.io), or [SimpleLogin](https://simplelogin.io).
          `}
        />

        <FAQItem
          question="How can I save my generated identity?"
          id="save-identity"
          answer={`
Use the two buttons in the gradient area above the first/last name to copy and save your identity.

* **Copy All**: Copies the entire identity to your clipboard, which you can then paste and save in your password manager, notes app, or any other secure location.

* **1Password Export**: If you use 1Password, simply click the 1Password icon to export the entire identity directly into a 1Password login. This creates a new entry in your password manager with all identity details neatly organized.
          `}
        />

        <FAQItem
          question="Where does all this random identity data come from?"
          id="data-sources"
          answer={`
Each piece of identity information comes from different sources:

* **Names, Phone Numbers, Birthdays**: Generated using [Faker.js](https://fakerjs.dev/), which provides a large dataset of realistic names. First and last names are randomly paired for diverse combinations.

* **Usernames**: Created from our [Username Generator](/username), which uses the same adjective/noun word lists that are used for the passphrase generator. For usernames, there are 1,024 adjectives + 1,024 nouns + 32 numbers available.

* **Passphrases**: Generated using our [Passphrase Generator](/) with the same security principles and word selection methodology.

* **Addresses**: Real, geocodable addresses from a curated set of 2,095 locations sourced from [OpenAddresses.io](https://openaddresses.io/). Useful for forms requiring address verification.

* **Disposable Emails**: Created based on the username and hosted on:
  - [Reusable.email](https://reusable.email) - Well designed and easy to use.
  - Optional: [Maildrop.cc](https://maildrop.cc) and [Inbox Kitten](https://inboxkitten.com)

* **Avatar Images**: Multiple sources including:
  - "Real Photos" - 178 real photographs
  - "AI-Generated" - 200 AI-generated realistic portraits
  - "Avatar Generators" - Various avatar generators with thousands of possible combinations

You can customize which avatar types and email providers to use via the dropdowns in the toolbar.
          `}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function IdentityPage() {
  return (
    <div className="container p-4 overflow-visible">
      <h2 className="text-2xl font-heading font-bold mb-4">
        Identity Generator
      </h2>

      <div className="bg-indigo-100/70 dark:bg-indigo-950/30 py-4 px-8 rounded-lg mb-6">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold">
            How to use a fake identity to protect your privacy
          </h3>
          <p className="text-muted-foreground">
            Protect your privacy online by using generated identities instead of
            your real information. This helps prevent{" "}
            <a
              href="https://en.wikipedia.org/wiki/Doxxing"
              className="text-blue-500 hover:underline"
            >
              doxxing
            </a>{" "}
            and keeps your personal data secure.
          </p>
        </div>
      </div>

      <IdentityDisplay />

      <div className="mt-16">
        <IdentityFAQ />
      </div>
    </div>
  );
}
