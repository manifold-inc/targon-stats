"use client";

import hljs from "highlight.js/lib/core";
import http from "highlight.js/lib/languages/http";
import json from "highlight.js/lib/languages/json";
import { useEffect, useRef } from "react";

// Register languages
hljs.registerLanguage("json", json);
hljs.registerLanguage("http", http);

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = "json" }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <pre className="overflow-x-auto text-sm">
      <code ref={codeRef} className={`language-${language}`}>
        {code}
      </code>
    </pre>
  );
}
