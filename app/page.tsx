"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/animated-section"
import { StaggeredContainer } from "@/components/staggered-container"
import { FeatureCard } from "@/components/feature-card"
import { StepCard } from "@/components/step-card"
import { BusinessCard } from "@/components/business-card"
import { TeamCard } from "@/components/team-card"
import { Navbar } from "@/components/navbar"
import { Lightbulb, DollarSign, MapPin, User, Cpu, FileText } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-20 relative bg-grid-pattern">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  Launch Your <span className="text-amber-500">Dream Business</span> in Kenya
                </h1>
                <p className="text-lg text-gray-300">
                  Get AI-generated personalized business ideas tailored to your skills, interests, and Kenya's market
                  opportunities.
                </p>
                <div className="pt-4">
                  <Link href="/auth/register">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-8 py-6 text-lg">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/images/hero-image.jpg"
                  alt="Kenyan entrepreneur using a smartphone at a local market"
                  fill
                  className="object-cover rounded-xl"
                  priority
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-center mb-16">
              Why Choose <span className="text-amber-500">BizMatchKE</span>
            </h2>
          </AnimatedSection>

          <StaggeredContainer className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Lightbulb className="h-10 w-10 text-amber-500" />}
              title="Instant Recommendations"
              description="Get personalized business ideas instantly based on your unique profile and preferences."
            />
            <FeatureCard
              icon={<DollarSign className="h-10 w-10 text-amber-500" />}
              title="Budget-Smart"
              description="Find business opportunities that match your available capital and financial goals."
            />
            <FeatureCard
              icon={<MapPin className="h-10 w-10 text-amber-500" />}
              title="Location-Aware"
              description="Discover business ideas optimized for your specific location within Kenya."
            />
          </StaggeredContainer>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-center mb-16">
              How <span className="text-amber-500">BizMatchKE</span> Works
            </h2>
          </AnimatedSection>

          <div className="relative">
            {/* Removed connector lines as requested */}
            <StaggeredContainer className="grid md:grid-cols-3 gap-8 relative z-10">
              <StepCard
                number={1}
                title="Tell Us About You"
                description="Share your skills, interests, budget, and location preferences."
                icon={<User className="h-6 w-6" />}
              />
              <StepCard
                number={2}
                title="AI Magic Happens"
                description="Our AI analyzes market trends and matches them with your profile."
                icon={<Cpu className="h-6 w-6" />}
              />
              <StepCard
                number={3}
                title="Get Custom Ideas"
                description="Receive tailored business recommendations with implementation guides."
                icon={<FileText className="h-6 w-6" />}
              />
            </StaggeredContainer>
          </div>
        </div>
      </section>

      {/* Business Examples Section */}
      <section id="business-examples" className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-center mb-16">
              Business <span className="text-amber-500">Opportunities</span>
            </h2>
          </AnimatedSection>

          <StaggeredContainer className="grid md:grid-cols-3 gap-8">
            <BusinessCard
              title="Eco-Friendly Packaging"
              image="/images/image_package.jpg"
              description="Sustainable packaging solutions for local businesses."
            />
            <BusinessCard
              title="Mobile Agricultural Services"
              image="/images/image_agric.jpg"
              description="Tech-enabled services for small-scale farmers."
            />
            <BusinessCard
              title="Online Skills Marketplace"
              image="/images/image_online.jpg"
              description="Platform connecting skilled professionals with clients."
            />
          </StaggeredContainer>

          <AnimatedSection delay={0.6}>
            <p className="text-center mt-12 text-gray-300 max-w-3xl mx-auto">
              These are just a few examples of the innovative business ideas our platform can generate. Your
              personalized recommendations will be tailored to your specific skills and interests.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-center mb-16">
              Meet Our <span className="text-amber-500">Team</span>
            </h2>
          </AnimatedSection>

          <StaggeredContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TeamCard
              name="Mercy Okumu"
              role=""
              image="/images/team-mercy.jpg"
              description="Passionate about empowering Kenyan entrepreneurs with innovative solutions."
            />
            <TeamCard
              name="Jotham Mboya"
              role=""
              image="/images/team-jotham.jpg"
              description="Tech visionary with expertise in AI and machine learning applications."
            />
            <TeamCard
              name="Faith Cherotich"
              role=""
              image="/images/team-faith.jpg"
              description="Market research specialist with deep knowledge of Kenya's business landscape."
            />
            <TeamCard
              name="Maxwell Masai"
              role=""
              image="/images/team-maxwell.jpg"
              description="Experienced in scaling startups and creating strategic partnerships."
            />
            <TeamCard
              name="Vallary Seroney"
              role=""
              image="/images/team-vallary.jpg"
              description="Dedicated to building and nurturing the BizMatchKE entrepreneur community."
            />
          </StaggeredContainer>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-black/80 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <Link href="/" className="text-amber-500 font-bold text-2xl block mb-4">
                BizMatchKE
              </Link>
              <p className="text-gray-400 mb-6">
                Empowering Kenyan entrepreneurs with AI-driven business recommendations tailored to their unique
                profiles and market opportunities.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 hover:text-amber-500 transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                    }}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-gray-400 hover:text-amber-500 transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                    }}
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#team"
                    className="text-gray-400 hover:text-amber-500 transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById("team")?.scrollIntoView({ behavior: "smooth" })
                    }}
                  >
                    Team
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-400 mb-2">Nairobi, Kenya</p>
              <p className="text-gray-400 mb-4">info@bizmatchke.com</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} BizMatchKE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
