"use client";

import { useState, Children, type ReactNode } from "react";
import { RefreshCw, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface PageToolbarProps {
  onGenerate?: () => void;
  generateButtonText?: string;
  children?: ReactNode;
  isSticky?: boolean;
  className?: string;
  modalTitle?: string;
  hideButton?: boolean;
  alwaysShowChildren?: boolean;
}

export default function PageToolbar({
  onGenerate,
  generateButtonText,
  children,
  isSticky = false,
  className = "",
  modalTitle = "Options",
  hideButton = false,
  alwaysShowChildren = false,
}: PageToolbarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const hasChildren = Children.count(children) > 0;

  const handleGenerate = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500);
    onGenerate?.();
  };

  return (
    <div
      className={cn(
        "flex flex-row gap-3 items-start justify-start",
        isSticky ? "sticky top-0 py-4 bg-background z-10" : "mb-3",
        className
      )}
    >
      {!hideButton && (
        <Button size="lg" onClick={handleGenerate} className="text-base md:text-xl">
          <RefreshCw
            className={cn(
              "size-4 transition-transform",
              isSpinning && "animate-spin"
            )}
          />
          {generateButtonText}
        </Button>
      )}

      {!alwaysShowChildren && hasChildren && (
        <div className="md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSheetOpen(true)}
            aria-label="Show options"
          >
            <Settings className="size-4" />
            <span className="text-sm">Options</span>
          </Button>
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>{modalTitle}</SheetTitle>
            <SheetDescription className="sr-only">
              Configure generation options
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-4">
            {Children.map(children, (child) => (
              <div className="w-full">{child}</div>
            ))}
            <Button
              className="w-full"
              onClick={() => setIsSheetOpen(false)}
            >
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          alwaysShowChildren ? "flex" : "hidden md:flex",
          "md:flex-row gap-3 items-start md:items-end w-full"
        )}
      >
        {children}
      </div>
    </div>
  );
}
