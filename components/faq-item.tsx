"use client";

import MarkdownCustom from "@/components/markdown-custom";

interface FAQItemProps {
  question: string;
  id?: string;
  answer: string;
}

export default function FAQItem({ question, id, answer }: FAQItemProps) {
  return (
    <div id={id} className="space-y-2">
      <h2 className="text-xl font-semibold">{question}</h2>
      <MarkdownCustom>{answer}</MarkdownCustom>
    </div>
  );
}
