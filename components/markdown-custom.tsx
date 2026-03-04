"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { stripIndent } from "common-tags";
import { cn } from "@/lib/utils";

function MarkdownTableWrapper({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">{children}</table>
    </div>
  );
}

const renderers: Components = {
  table: MarkdownTableWrapper as Components["table"],
};

interface MarkdownCustomProps {
  children: string;
  className?: string;
  [key: string]: unknown;
}

export default function MarkdownCustom({
  children,
  className,
  ...props
}: MarkdownCustomProps) {
  if (typeof children !== "string") {
    console.error("MarkdownCustom expects a string as children");
    return null;
  }

  return (
    <ReactMarkdown
      className={cn("prose dark:prose-invert max-w-none", className)}
      components={renderers}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      {...props}
    >
      {stripIndent(children)}
    </ReactMarkdown>
  );
}
