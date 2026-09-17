"use client";

/**
 * A sample 4-photo film strip in a faceted chrome window — pure "here's the
 * vibe" flavor for the hero, not tied to the user's actual chosen theme or
 * layout (that choice happens later, in the capture flow itself).
 */
export function StripPreview() {
  return (
    <div
      aria-hidden
      className="booth-strip-frame facet-sm flex w-14 flex-col p-1 sm:w-16"
      style={{ transform: "rotate(-4deg)" }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="booth-strip-photo aspect-[4/3] w-full" />
      ))}
    </div>
  );
}
