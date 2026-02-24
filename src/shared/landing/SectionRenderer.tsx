import type { LandingSection } from "../types";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { CTA } from "./CTA";
import { Testimonials } from "./Testimonials";
import { FAQ } from "./FAQ";

export function SectionRenderer({ sections }: { sections: LandingSection[] }) {
  return (
    <>
      {sections.map((section, i) => {
        switch (section.type) {
          case "hero":
            return <Hero key={i} {...section} />;
          case "features":
            return <Features key={i} {...section} />;
          case "cta":
            return <CTA key={i} {...section} />;
          case "testimonials":
            return <Testimonials key={i} {...section} />;
          case "faq":
            return <FAQ key={i} {...section} />;
        }
      })}
    </>
  );
}
