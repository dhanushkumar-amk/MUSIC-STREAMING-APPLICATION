import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
import { Music, Zap, WifiOff, Mic2, Radio, Headphones, Sparkles, Share2, Globe } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Music,
    title: "Lossless Audio",
    desc: "Experience sound in its purest form with high-fidelity streaming up to 24-bit/192kHz.",
    className: "md:col-span-2 bg-gradient-to-br from-primary/10 to-transparent"
  },
  {
    icon: Zap,
    title: "AI Playlists",
    desc: "Smart algorithms that understand your taste instantly.",
    className: "bg-secondary/50"
  },
  {
    icon: WifiOff,
    title: "Offline Mode",
    desc: "Download your favorites and listen anywhere, no data required.",
    className: "bg-background border-2"
  },
  {
    icon: Globe,
    title: "Global Connect",
    desc: "Listen to what the world is playing in real-time.",
    className: "md:col-span-2 bg-gradient-to-bl from-indigo-500/10 to-transparent"
  },
  {
    icon: Mic2,
    title: "Lyrics & Karaoke",
    desc: "Sing along with real-time lyrics.",
    className: "bg-background border-2"
  },
  {
    icon: Share2,
    title: "Social Listening",
    desc: "Join listening parties with friends.",
    className: "bg-secondary/50"
  },
]

export default function Features() {
  return (
    <section className="py-32 bg-background relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles size={12} /> Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">More than just streaming</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                Discover why millions of users choose SoundWave as their daily driver for audio entertainment.
            </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 auto-rows-[300px]">
          {features.map((f, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={f.className}
            >
                <Card className={`h-full border border-border/50 bg-white/60 dark:bg-card/40 backdrop-blur-md shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-primary/20 transition-all duration-300 flex flex-col`}>
                <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-background shadow-sm flex items-center justify-center text-primary mb-6 ring-1 ring-black/5">
                        <f.icon size={28} />
                    </div>
                    <CardTitle className="text-2xl mb-3">{f.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{f.desc}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                    {/* Decorative elements based on index for visual variety */}
                    {i === 0 && <div className="h-2 w-full bg-gradient-to-r from-primary/40 to-transparent rounded-full" />}
                    {i === 1 && <div className="flex gap-2"><div className="w-8 h-8 rounded-full bg-primary/20" /><div className="w-8 h-8 rounded-full bg-primary/40" /></div>}
                </CardContent>
                </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
