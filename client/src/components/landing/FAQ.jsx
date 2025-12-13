import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { motion } from "framer-motion"

export default function FAQ() {
  return (
    <section className="py-24 bg-gradient-to-b from-transparent to-muted/30 relative">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
        >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about SoundWave.</p>
        </motion.div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="border border-border/60 px-4 rounded-xl bg-background/50 backdrop-blur-sm hover:border-primary/30 hover:bg-background/80 transition-all duration-200">
            <AccordionTrigger className="text-left font-medium">Is SoundWave really free?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              Yes! You can listen to music for free with ads. Upgrade to Premium for an ad-free experience, offline downloads, and higher quality audio.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border border-border/60 px-4 rounded-xl bg-background/50 backdrop-blur-sm hover:border-primary/30 hover:bg-background/80 transition-all duration-200">
            <AccordionTrigger className="text-left font-medium">Can I download music offline?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              Offline listening is available for all Premium subscribers. Download your favorite tracks, albums, and playlists to listen anywhere without data.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border border-border/60 px-4 rounded-xl bg-background/50 backdrop-blur-sm hover:border-primary/30 hover:bg-background/80 transition-all duration-200">
            <AccordionTrigger className="text-left font-medium">How does the Family plan work?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              The Family plan allows up to 6 distinct accounts under one bill. Everyone keeps their own music library, history, and recommendations. It includes parental controls for kids' accounts.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="border border-border/60 px-4 rounded-xl bg-background/50 backdrop-blur-sm hover:border-primary/30 hover:bg-background/80 transition-all duration-200">
            <AccordionTrigger className="text-left font-medium">Can I cancel anytime?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              Absolutely. There are no contracts or commitments. You can cancel your Premium subscription at any time from your account settings.
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="item-5" className="border border-border/60 px-4 rounded-xl bg-background/50 backdrop-blur-sm hover:border-primary/30 hover:bg-background/80 transition-all duration-200">
            <AccordionTrigger className="text-left font-medium">What audio quality do you offer?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              Free users get 128kbps AAC. Premium users get up to 320kbps, and we offer a HiFi tier with lossless FLAC audio for audiophiles.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
