import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Heart, Search, Music, Disc, User, Settings } from "lucide-react";

/**
 * Component Showcase Page
 * Demonstrates all UI components and design patterns used in the app
 */
export default function ShowcasePage() {
  const [volume, setVolume] = useState([75]);

  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
          SoundWave UI Components
        </h1>
        <p className="text-muted-foreground text-lg">
          Modern, glassmorphic design system with smooth animations
        </p>
      </div>

      {/* Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" className="rounded-full">
            <Play className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Cards Section */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Song Card */}
          <div className="group cursor-pointer">
            <div className="relative mb-4 overflow-hidden rounded-2xl shadow-lg aspect-square bg-gradient-to-br from-purple-500 to-pink-500">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button className="absolute bottom-4 right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl hover:scale-110">
                <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
              </button>
            </div>
            <h3 className="font-bold truncate">Song Title</h3>
            <p className="text-sm text-muted-foreground truncate">Artist Name</p>
          </div>

          {/* Album Card */}
          <div className="bg-card/40 backdrop-blur p-6 rounded-2xl hover:bg-card/60 transition-all cursor-pointer group border border-border/50">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Album Title</h3>
            <p className="text-muted-foreground">12 songs</p>
          </div>

          {/* Playlist Card */}
          <div className="bg-card/40 backdrop-blur p-6 rounded-2xl hover:bg-card/60 transition-all cursor-pointer group border border-border/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h3 className="font-bold">Liked Songs</h3>
                <p className="text-xs text-muted-foreground">124 songs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inputs Section */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Inputs</h2>
        <div className="space-y-4 max-w-md">
          <Input placeholder="Standard input" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input placeholder="Search..." className="pl-10" />
          </div>
          <Input type="password" placeholder="Password input" />
        </div>
      </section>

      {/* Slider Section */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Sliders</h2>
        <div className="space-y-6 max-w-md">
          <div>
            <label className="text-sm font-medium mb-2 block">Volume: {volume[0]}%</label>
            <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Progress</label>
            <Slider defaultValue={[33]} max={100} step={1} />
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Tabs</h2>
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="bg-card/40 backdrop-blur p-6 rounded-2xl border border-border/50">
              <p className="text-muted-foreground">All content goes here...</p>
            </div>
          </TabsContent>
          <TabsContent value="songs">Songs content</TabsContent>
          <TabsContent value="albums">Albums content</TabsContent>
          <TabsContent value="playlists">Playlists content</TabsContent>
        </Tabs>
      </section>

      {/* Dialog Section */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Dialogs</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Playlist name" />
              <Button className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* Icons Section */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Icons (Lucide React)</h2>
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col items-center gap-2">
            <Play className="w-8 h-8 text-primary" />
            <span className="text-xs">Play</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-xs">Heart</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Search className="w-8 h-8 text-primary" />
            <span className="text-xs">Search</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Music className="w-8 h-8 text-primary" />
            <span className="text-xs">Music</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Disc className="w-8 h-8 text-primary" />
            <span className="text-xs">Disc</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <User className="w-8 h-8 text-primary" />
            <span className="text-xs">User</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Settings className="w-8 h-8 text-primary" />
            <span className="text-xs">Settings</span>
          </div>
        </div>
      </section>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-primary" />
            <p className="text-sm font-medium">Primary</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-secondary" />
            <p className="text-sm font-medium">Secondary</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-muted" />
            <p className="text-sm font-medium">Muted</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-accent" />
            <p className="text-sm font-medium">Accent</p>
          </div>
        </div>
      </section>

      {/* Glassmorphism Examples */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Glassmorphism Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-6">
            <h3 className="font-bold mb-2">Light Glass</h3>
            <p className="text-sm text-muted-foreground">
              Subtle transparency with backdrop blur
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold mb-2">Heavy Glass</h3>
            <p className="text-sm text-muted-foreground">
              More opacity with stronger blur and shadow
            </p>
          </div>
        </div>
      </section>

      {/* Gradient Examples */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Gradients</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500" />
          <div className="h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500" />
          <div className="h-32 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500" />
          <div className="h-32 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500" />
        </div>
      </section>
    </div>
  );
}
