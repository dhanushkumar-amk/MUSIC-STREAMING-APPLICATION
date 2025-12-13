import { motion } from "framer-motion"
import { Button } from "../ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList
} from "../ui/navigation-menu"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Link } from "react-router-dom"

export default function Navbar() {
  const { theme, setTheme } = useTheme()

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm supports-[backdrop-filter]:bg-background/60"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2 tracking-tighter">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.65 14.65c-.2.34-.63.45-.97.25-2.65-1.62-5.99-1.99-9.92-1.09-.38.09-.77-.15-.86-.53-.09-.38.15-.77.53-.86 4.31-.98 8.07-.56 11.13 1.32.34.21.44.64.24.98zm1.39-3.1c-.25.41-.78.53-1.19.28-3.04-1.87-7.68-2.41-11.27-1.32-.46.14-.95-.12-1.09-.58-.14-.46.12-.95.58-1.09 4.09-1.24 9.25-.63 12.7 1.52.41.25.53.78.28 1.19zm.12-3.13C14.47 8.35 8.4 8.16 4.9 9.23c-.55.17-1.13-.14-1.3-.69-.17-.55.14-1.13.69-1.3 4.05-1.23 10.74-1.02 14.56 1.25.5.3.66.95.36 1.45-.3.5-.95.66-1.45.36z" />
            </svg>
            SoundWave
        </h1>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-6">
            <NavigationMenuItem>Features</NavigationMenuItem>
            <NavigationMenuItem>Premium</NavigationMenuItem>
            <NavigationMenuItem>About</NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <Link to="/auth/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
