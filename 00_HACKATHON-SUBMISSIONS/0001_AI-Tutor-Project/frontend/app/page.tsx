import { Hero } from '@/components/hero'
import { FeatureCards } from '@/components/feature-cards'
import { StatsSection } from '@/components/stats-section'

export default function HomePage() {
  return (
    <div className="space-y-16">
      <Hero />
      <FeatureCards />
      <StatsSection />
    </div>
  )
}