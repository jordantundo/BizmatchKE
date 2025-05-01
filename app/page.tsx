import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Features from "@/components/features"
import Process from "@/components/process"
import IdeaGenerator from "@/components/idea-generator"
import Team from "@/components/team"
import Impact from "@/components/impact"
import Businesses from "@/components/businesses"
import Footer from "@/components/footer"
import ScrollToSection from "@/components/scroll-to-section"

export default function Home() {
  return (
    <main>
      <ScrollToSection />
      <Navbar />
      <Hero />
      <Features />
      <Process />
      <IdeaGenerator />
      <Businesses />
      <Team />
      <Impact />
      <Footer />
    </main>
  )
}
