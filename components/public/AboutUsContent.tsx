import AboutCommitment from "@/components/public/about/AboutCommitment";
import AboutHero from "@/components/public/about/AboutHero";
import AboutLeadership from "@/components/public/about/AboutLeadership";
import AboutPrinciples from "@/components/public/about/AboutPrinciples";
import AboutStory from "@/components/public/about/AboutStory";

export default function AboutUsContent() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutPrinciples />
      <AboutLeadership />
      <AboutCommitment />
    </>
  );
}
