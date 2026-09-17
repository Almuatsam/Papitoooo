"use client";

import { useLanguage } from "@/hooks/use-language";

/** Chrome-gradient, magenta-glow wordmark — the booth's illuminated marquee sign. */
export function Wordmark() {
  const { t } = useLanguage();
  const words = t.app.name.split(" ");

  return (
    <h1 className="booth-wordmark text-xl leading-[0.95] sm:text-3xl">
      {words[0] ?? t.app.name}
      <br />
      {words.slice(1).join(" ") || t.app.name}
    </h1>
  );
}
