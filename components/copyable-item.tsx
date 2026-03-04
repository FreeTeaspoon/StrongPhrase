"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { FaRegCopy, FaCheck, FaInfoCircle, FaLink } from "react-icons/fa";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Stat {
  label: string;
  value: string;
}

interface CopyableItemProps {
  content?: string;
  label?: string;
  stats?: Stat[];
  showInfoIcon?: boolean;
  infoBits?: number | string | null;
  copyToClipboard?: (content: string, itemId: string) => void;
  copiedId?: string | null;
  itemId?: string;
  generationCount?: number;
  hideWhenOthersCopied?: boolean;
  showHidden?: boolean;
  className?: string;
  renderContentOnly?: boolean;
  showLabel?: boolean;
  noMarginBottom?: boolean;
  sourceLink?: string | null;
  refreshAnimation?: boolean;
  additionalContent?: ReactNode;
  children?: ReactNode;
  hideCopyTextBelowLg?: boolean;
}

export default function CopyableItem({
  content,
  label,
  stats = [],
  showInfoIcon = true,
  infoBits = null,
  copyToClipboard,
  copiedId,
  itemId: itemIdProp,
  generationCount,
  hideWhenOthersCopied = false,
  showHidden = true,
  className = "",
  renderContentOnly = true,
  showLabel = true,
  noMarginBottom = false,
  sourceLink = null,
  refreshAnimation = false,
  additionalContent = null,
  children,
  hideCopyTextBelowLg = false,
}: CopyableItemProps) {
  const itemId = useRef(
    itemIdProp || Math.random().toString(36).substring(2, 8)
  ).current;

  const [animating, setAnimating] = useState(false);
  const prevGenRef = useRef(generationCount);

  useEffect(() => {
    if (prevGenRef.current !== generationCount) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 300);
      prevGenRef.current = generationCount;
      return () => clearTimeout(timer);
    }
  }, [generationCount]);

  const isHidden =
    hideWhenOthersCopied && copiedId && copiedId !== itemId && !showHidden;
  const isCopied = copiedId === itemId;

  const handleCopy = () => {
    if (copyToClipboard && content) {
      copyToClipboard(content, itemId);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <div
      className={cn(
        "group transition-all duration-300",
        isCopied && "ring-2 ring-primary/30 rounded-lg",
        isHidden && "opacity-0 max-h-0 overflow-hidden",
        refreshAnimation && "animate-pulse",
        className
      )}
    >
      {showLabel && (
        <label className="mb-1 block tracking-wide">
          <div className="flex flex-col md:flex-row md:items-center gap-x-3">
            <div className="flex items-center">
              <span className="text-sm font-bold uppercase text-muted-foreground">
                {label}
              </span>
              {showInfoIcon && infoBits && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-2 cursor-help">
                        <FaInfoCircle className="text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {typeof infoBits === "number"
                        ? `${infoBits} bits of entropy`
                        : infoBits}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {sourceLink && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={sourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <FaLink className="size-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      Open source for this wordlist
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {stats.length > 0 && (
              <div className="text-sm text-muted-foreground mt-1 md:mt-0">
                {stats.map(({ label: statLabel, value }, index) => (
                  <span key={index}>
                    {index > 0 && <span className="mx-2">•</span>}
                    <span>
                      <span className="font-bold">{value}</span> {statLabel}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </label>
      )}

      {additionalContent && <div className="mb-2">{additionalContent}</div>}

      <div
        className={cn(
          "relative cursor-pointer rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50",
          !noMarginBottom && "mb-6"
        )}
        onClick={handleCopy}
      >
        <div className="relative overflow-hidden">
          <div
            className={cn(
              "transition-all duration-300",
              animating && "animate-in fade-in-0 slide-in-from-bottom-2"
            )}
          >
            {renderContentOnly && content}
            {children}
          </div>
        </div>

        <span
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-end transition-opacity",
            "opacity-100 md:opacity-0",
            "md:group-hover:opacity-100",
            isCopied && "md:opacity-100"
          )}
        >
          {isCopied ? (
            <FaCheck className="size-5 text-primary" />
          ) : (
            <FaRegCopy className="size-5 text-muted-foreground" />
          )}
        </span>
      </div>
    </div>
  );
}
