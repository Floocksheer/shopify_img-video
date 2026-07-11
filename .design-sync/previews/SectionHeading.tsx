import { SectionHeading } from "lumora";

export function Centered() {
  return (
    <SectionHeading
      eyebrow="How it works"
      title="Studio-grade product photos in three steps"
      description="Upload a single product shot, pick a background theme, and Lumora renders on-brand photos and videos ready for your Shopify store."
    />
  );
}

export function LeftAligned() {
  return (
    <SectionHeading
      align="left"
      eyebrow="Competitor analysis"
      title="See what top stores do differently"
      description="Claude Vision breaks down the visual strategy behind best-selling product pages."
    />
  );
}
