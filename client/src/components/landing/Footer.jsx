import { Facebook, Twitter, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t pt-24 pb-12 bg-muted/20 dark:bg-muted/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 mb-16">
        <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                 <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.65 14.65c-.2.34-.63.45-.97.25-2.65-1.62-5.99-1.99-9.92-1.09-.38.09-.77-.15-.86-.53-.09-.38.15-.77.53-.86 4.31-.98 8.07-.56 11.13 1.32.34.21.44.64.24.98zm1.39-3.1c-.25.41-.78.53-1.19.28-3.04-1.87-7.68-2.41-11.27-1.32-.46.14-.95-.12-1.09-.58-.14-.46.12-.95.58-1.09 4.09-1.24 9.25-.63 12.7 1.52.41.25.53.78.28 1.19zm.12-3.13C14.47 8.35 8.4 8.16 4.9 9.23c-.55.17-1.13-.14-1.3-.69-.17-.55.14-1.13.69-1.3 4.05-1.23 10.74-1.02 14.56 1.25.5.3.66.95.36 1.45-.3.5-.95.66-1.45.36z" />
                </svg>
                SoundWave
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                Music for everyone. Millions of songs. No credit card needed. Join the revolution in audio streaming today.
            </p>
        </div>
        <div>
            <h4 className="font-semibold mb-6 text-foreground">Company</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors block w-fit">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors block w-fit">Jobs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors block w-fit">For the Record</a></li>
                <li><a href="#" className="hover:text-primary transition-colors block w-fit">Newsroom</a></li>
            </ul>
        </div>
        <div>
            <h4 className="font-semibold mb-6 text-foreground">Communities</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors block w-fit">For Artists</a></li>
                <li><a href="#" className="hover:text-primary transition-colors block w-fit">Developers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors block w-fit">Advertising</a></li>
                <li><a href="#" className="hover:text-primary transition-colors block w-fit">Investors</a></li>
                <li><a href="#" className="hover:text-primary transition-colors block w-fit">Vendors</a></li>
            </ul>
        </div>
        <div>
            <h4 className="font-semibold mb-6 text-foreground">Social</h4>
            <div className="flex gap-5 text-muted-foreground">
                <a href="#" className="hover:text-primary hover:scale-110 transition-all"><Twitter size={20} /></a>
                <a href="#" className="hover:text-primary hover:scale-110 transition-all"><Instagram size={20} /></a>
                <a href="#" className="hover:text-primary hover:scale-110 transition-all"><Facebook size={20} /></a>
            </div>
        </div>
      </div>
      <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2025 SoundWave. All rights reserved.</p>
            <div className="flex gap-8">
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
                <a href="#" className="hover:text-primary transition-colors">Cookies</a>
            </div>
        </div>
      </div>
    </footer>
  )
}
