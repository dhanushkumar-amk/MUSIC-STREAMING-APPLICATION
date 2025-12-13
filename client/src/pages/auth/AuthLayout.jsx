import { motion } from "framer-motion";
import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden items-center justify-center text-white p-16">
        <div className="absolute inset-0 bg-zinc-950">
            <img
                src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=2574&auto=format&fit=crop"
                alt="Music Abstract"
                className="w-full h-full object-cover opacity-30 mix-blend-overlay scale-110"
            />
             <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-xl space-y-8">
             <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
             >
                <Link to="/" className="inline-flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity">
                     <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-primary">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.65 14.65c-.2.34-.63.45-.97.25-2.65-1.62-5.99-1.99-9.92-1.09-.38.09-.77-.15-.86-.53-.09-.38.15-.77.53-.86 4.31-.98 8.07-.56 11.13 1.32.34.21.44.64.24.98zm1.39-3.1c-.25.41-.78.53-1.19.28-3.04-1.87-7.68-2.41-11.27-1.32-.46.14-.95-.12-1.09-.58-.14-.46.12-.95.58-1.09 4.09-1.24 9.25-.63 12.7 1.52.41.25.53.78.28 1.19zm.12-3.13C14.47 8.35 8.4 8.16 4.9 9.23c-.55.17-1.13-.14-1.3-.69-.17-.55.14-1.13.69-1.3 4.05-1.23 10.74-1.02 14.56 1.25.5.3.66.95.36 1.45-.3.5-.95.66-1.45.36z" />
                    </svg>
                    <span className="text-4xl font-bold tracking-tight">SoundWave</span>
                </Link>

                <blockquote className="space-y-4">
                    <p className="text-3xl font-medium leading-relaxed">
                        "Music is the wine that fills the cup of silence. Join us and experience audio like never before."
                    </p>
                    <footer className="text-lg text-muted-foreground font-medium">— Audio Team</footer>
                </blockquote>
             </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        <div className="absolute top-8 right-8 hidden md:block">
            {/* Optional: Add a helper link or theme toggle here */}
        </div>
        <div className="w-full max-w-md space-y-8">
            <Outlet />
        </div>
      </div>
    </div>
  );
}
