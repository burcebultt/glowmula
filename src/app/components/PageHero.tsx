import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image: string;
}

export function PageHero({ title, subtitle, image }: PageHeroProps) {
  return (
    <section className="relative min-h-[340px] md:h-[420px] flex flex-col items-center justify-center overflow-hidden">
      <ImageWithFallback
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative px-6 md:px-20 flex flex-col items-center gap-5 py-16 text-center">
        <h1 className="text-white" style={{ fontFamily: "Lora", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 400 }}>
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-[640px] text-white/85" style={{ fontFamily: "Geist", fontSize: 18, lineHeight: "30px" }}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
