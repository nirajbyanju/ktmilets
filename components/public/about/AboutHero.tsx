import { aboutDescription, aboutTitle } from "@/components/public/about/about.data";
import PublicPageHero from "@/components/public/shared/PublicPageHero";

export default function AboutHero() {
  return (
    <PublicPageHero eyebrow="About Us" title={aboutTitle} description={aboutDescription} />
  );
}
