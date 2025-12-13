import { Check } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { motion } from "framer-motion"

const plans = [
  {
    name: "Free",
    price: "$0",
    desc: "Perfect for exploring",
    features: ["Ad-supported listening", "Mobile app access", "Standard audio quality", "Limited skips"]
  },
  {
    name: "Premium",
    price: "$9.99",
    desc: "The complete experience",
    features: ["Ad-free music", "Offline playback", "High-fidelity audio", "Unlimited skips", "Cross-platform sync", "Exclusive content"],
    featured: true
  },
  {
    name: "Family",
    price: "$14.99",
    desc: "For the whole house",
    features: ["Up to 6 Premium accounts", "Block explicit music", "Family Mix playlist", "Kids app access", "All Premium features"]
  }
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20">
            Now Completely Free
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Simple, transparent pricing</h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Start for free, upgrade for the best experience. Cancel anytime.
          </p>
        </motion.div>

        <Tabs defaultValue="monthly" className="w-full max-w-5xl mx-auto">
          <div className="flex justify-center mb-12">
            <TabsList className="grid w-[300px] grid-cols-2 p-1 bg-muted/50 backdrop-blur rounded-full">
              <TabsTrigger value="monthly" className="rounded-full">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="rounded-full">Yearly (-20%)</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly" className="grid md:grid-cols-3 gap-8 text-left">
            {plans.map((plan, i) => (
              <PricingCard key={i} plan={plan} />
            ))}
          </TabsContent>

          <TabsContent value="yearly" className="grid md:grid-cols-3 gap-8 text-left">
            {plans.map((plan, i) => (
              <PricingCard
                key={i}
                plan={{
                  ...plan,
                  price: plan.price === "$0" ? "$0" : "$" + (parseFloat(plan.price.slice(1)) * 10).toFixed(2)
                }}
                period="/year"
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

function PricingCard({ plan, period = "/month" }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={`h-full flex flex-col relative overflow-hidden border transition-all duration-300 ${
        plan.featured
          ? 'border-primary shadow-2xl shadow-primary/10 bg-white/90 dark:bg-card/90 backdrop-blur-xl scale-105 z-10'
          : 'border-border bg-white/60 dark:bg-card/40 backdrop-blur-md hover:border-primary/50 hover:shadow-lg hover:bg-white/80 dark:hover:bg-card/60'
      }`}>
        {plan.featured && (
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        )}

        <CardHeader>
          {plan.featured && (
            <span className="text-xs font-bold text-primary tracking-wider mb-2 uppercase">Most Popular</span>
          )}
          <CardTitle className="text-2xl">{plan.name}</CardTitle>
          <CardDescription>{plan.desc}</CardDescription>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-bold">{plan.price}</span>
            <span className="text-muted-foreground">{period}</span>
          </div>
          <ul className="space-y-4">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground/90">
                <div className={`mt-0.5 rounded-full p-0.5 ${plan.featured ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Check className="w-3 h-3" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full h-12 text-base font-semibold rounded-xl"
            variant={plan.featured ? "default" : "secondary"}
          >
            Get Started
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
