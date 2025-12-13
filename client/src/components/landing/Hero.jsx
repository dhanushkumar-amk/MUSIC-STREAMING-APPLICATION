import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { PlayCircle, ArrowRight, Star } from "lucide-react"
import { Link } from "react-router-dom"

export default function Hero() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/30 blur-[120px] rounded-full opacity-60 animate-pulse mix-blend-multiply dark:mix-blend-normal dark:opacity-30" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/20 blur-[100px] rounded-full opacity-60 mix-blend-multiply dark:mix-blend-normal dark:opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-background/80 border border-primary/20 backdrop-blur-md shadow-sm text-sm font-medium text-foreground"
          >
            <Badge variant="secondary" className="rounded-full px-2 bg-primary/20 text-primary hover:bg-primary/30">New</Badge>
            <span className="text-muted-foreground">Spatial Audio is now available</span>
            <ArrowRight size={14} className="text-muted-foreground" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-8">
            Feel the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-400 to-emerald-500">
              Rhythm.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10">
            Immerse yourself in over 100 million songs with high-fidelity sound. Your personal soundtrack, redefined.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/auth/register">
                <Button size="lg" className="h-16 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all duration-300">
                Start Free Trial <PlayCircle className="ml-2 w-6 h-6" />
                </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full border-2 bg-background/50 backdrop-blur hover:bg-background/80" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              View Plans
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 pt-8 border-t border-border/50">
             <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-background bg-muted overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="User" />
                    </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-background bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    +2M
                </div>
             </div>
             <div className="text-sm">
                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                    <Star fill="currentColor" size={16} />
                    <Star fill="currentColor" size={16} />
                    <Star fill="currentColor" size={16} />
                    <Star fill="currentColor" size={16} />
                    <Star fill="currentColor" size={16} />
                </div>
                <p className="font-medium text-muted-foreground">Rated 4.9/5 on App Store</p>
             </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
          className="relative mx-auto w-full max-w-[500px] lg:max-w-none perspective-1000"
        >
          {/* Main Hero Card */}
          <div className="relative z-20 transform transition-transform hover:scale-[1.02] duration-500">
            <Card className="rounded-[3rem] overflow-hidden shadow-2xl border-0 ring-1 ring-white/20 bg-black">
                <CardContent className="p-0 relative h-[600px] lg:h-[700px]">
                    <img
                        src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-90"
                        alt="Hero"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-10">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-4 inline-flex items-center gap-3 w-fit">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-white text-sm font-medium">Live Now</span>
                        </div>
                        <h3 className="text-4xl font-bold text-white mb-2">Weekly Top 50</h3>
                        <p className="text-white/80 text-lg">Global Hits • Updated today</p>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* Floating Music Player */}
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-1/2 -right-12 z-30 bg-background/95 dark:bg-card/90 backdrop-blur-xl p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border/50 w-64 hidden lg:block"
          >
            <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shrink-0" />
                <div>
                    <p className="font-bold text-foreground">Neon Nights</p>
                    <p className="text-xs text-muted-foreground">Synthwave Mix</p>
                </div>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full w-2/3 bg-primary rounded-full" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>1:24</span>
                <span>3:45</span>
            </div>
          </motion.div>

           {/* Floating Genre Tag */}
           <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -left-10 z-10 bg-background/90 backdrop-blur-lg px-6 py-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border hidden lg:block"
           >
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🎧</span>
                    <div>
                        <p className="font-bold leading-none">Immersive</p>
                        <p className="text-xs text-muted-foreground">Sound Quality</p>
                    </div>
                </div>
           </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
