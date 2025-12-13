import Navbar from "../components/layout/Navbar"
import Hero from "../components/landing/Hero"
import Features from "../components/landing/Features"
import CTA from "../components/landing/CTA"
import Footer from "../components/landing/Footer"
import LogoMarquee from "../components/landing/LogoMarquee"
import Pricing from "../components/landing/Pricing"
import FAQ from "../components/landing/FAQ"

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 relative">
      {/* Global Background Dotted Pattern */}
      <div className="fixed inset-0 pointer-events-none -z-[1]">
         <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)]"></div>
         <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal dark:bg-primary/10" />
         <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal dark:bg-indigo-500/10" />
      </div>
      <Navbar />
      <Hero />
      <LogoMarquee />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
