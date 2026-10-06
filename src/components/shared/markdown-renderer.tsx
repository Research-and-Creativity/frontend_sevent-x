"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`font-sans text-xs leading-relaxed text-text-secondary ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className="font-display font-bold text-lg text-white mt-4 mb-2 first:mt-0 pb-1 border-b border-white/10"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="font-display font-bold text-base text-white mt-3.5 mb-1.5 first:mt-0"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="font-display font-bold text-sm text-white mt-3 mb-1 first:mt-0"
              {...props}
            />
          ),
          h4: ({ ...props }) => (
            <h4
              className="font-display font-semibold text-xs text-white mt-2.5 mb-1 first:mt-0"
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <p className="mb-2 text-xs text-text-secondary leading-relaxed last:mb-0" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold text-white" {...props} />
          ),
          em: ({ ...props }) => (
            <em className="italic text-white/90" {...props} />
          ),
          del: ({ ...props }) => (
            <del className="line-through text-text-secondary/60" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-xs text-text-secondary pl-1" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 text-xs text-text-secondary pl-1" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="text-xs text-text-secondary leading-relaxed" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-2 border-accent pl-3 py-1 my-2 bg-surface/40 rounded-r-lg italic text-text-secondary text-xs" {...props} />
          ),
          code: ({ className: codeClassName, children, ...props }: any) => {
            const isInline = !codeClassName && typeof children === "string" && !children.includes("\n");
            if (isInline) {
              return (
                <code className="bg-surface/80 text-accent px-1.5 py-0.5 rounded text-[11px] font-mono border border-white/10" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="my-2 rounded-xl bg-surface/90 border border-white/10 p-3 overflow-x-auto">
                <code className="text-accent font-mono text-[11px] block leading-relaxed" {...props}>
                  {children}
                </code>
              </div>
            );
          },
          a: ({ ...props }) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline inline-flex items-center gap-1 font-medium transition-colors"
              {...props}
            />
          ),
          hr: () => <hr className="border-t border-white/10 my-4" />,
          table: ({ ...props }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-surface/40">
              <table className="w-full text-left text-xs border-collapse" {...props} />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="bg-surface border-b border-white/10 font-mono text-white" {...props} />
          ),
          tbody: ({ ...props }) => (
            <tbody className="divide-y divide-white/5" {...props} />
          ),
          tr: ({ ...props }) => (
            <tr className="hover:bg-surface/30 transition-colors" {...props} />
          ),
          th: ({ ...props }) => (
            <th className="p-2.5 font-semibold text-white font-mono text-[11px]" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="p-2.5 text-text-secondary text-xs" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
