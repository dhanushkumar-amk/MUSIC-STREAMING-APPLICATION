import { Button } from "../ui/button"
import { Link } from "react-router-dom"

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="relative rounded-[2.5rem] p-10 md:p-20 overflow-hidden bg-primary shadow-2xl ring-1 ring-white/10">
            {/* Abstract Background Patterns */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl z-0 mix-blend-overlay" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-black/10 rounded-full blur-3xl z-0" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px] z-0 opacity-30"></div>

            <div className="relative z-10 text-center text-primary-foreground">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8">Start your music journey.</h2>
                <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                    Join millions of users and discover music that moves you. Try Premium free for 30 days.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                    <Link to="/auth/register">
                        <Button size="lg" variant="secondary" className="h-16 px-10 text-lg rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all bg-background text-foreground hover:bg-background/90 border-0">
                            Get Started Free
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground hover:border-primary-foreground transition-all backdrop-blur-sm" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                        View Plans
                    </Button>
                </div>
                <p className="mt-10 text-sm opacity-60 font-semibold tracking-widest uppercase">No credit card required for free tier</p>
            </div>
        </div>
      </div>
    </section>
  )
}
