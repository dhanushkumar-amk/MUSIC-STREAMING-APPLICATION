import { motion } from "framer-motion";

const logos = [
  "Spotify", "Apple Music", "SoundCloud", "Tidal",
  "Deezer", "Pandora", "YouTube Music", "Amazon Music",
  "Spotify", "Apple Music", "SoundCloud", "Tidal"
];

export default function LogoMarquee() {
  return (
    <section className="py-12 border-y bg-background/50 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em]">
          Trusted by Global Platforms
        </p>
      </div>

      <div className="flex overflow-hidden">
        <motion.div
          className="flex gap-16 items-center whitespace-nowrap"
          animate={{ x: [0, -1000] }}
          transition={{
            repeat: Infinity,
            duration: 40,
            ease: "linear"
          }}
        >
          {[...logos, ...logos, ...logos].map((logo, i) => (
            <span
              key={i}
              className="text-2xl md:text-3xl font-bold text-foreground/30 dark:text-foreground/20 hover:text-primary transition-colors cursor-default"
            >
              {logo}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
