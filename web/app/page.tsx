"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">OC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">OpenCall</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#solutions" className="text-gray-600 hover:text-gray-900">Solutions</a>
            <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-orange-500 text-white hover:bg-orange-600">
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-orange-500 mb-4">
            EXPERT MENTORSHIP &amp; NETWORKING
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Talk to Industry Experts.<br />Get Real Career Clarity.
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Skip the guessing game. Book 1-on-1 video calls with top mentors<br />
            from the world's most innovative companies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login">
              <Button className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-3 text-lg h-auto">
                Book a Call →
              </Button>
            </Link>
          </div>


        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Get the guidance you need in three simple steps.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                1. Find your Expert
              </h3>
              <p className="text-gray-600">
                Browse hundreds of verified mentors by industry, role, or company.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                2. Book a Slot
              </h3>
              <p className="text-gray-600">
                Select a time that works for you. No back-and-forth emails needed.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                3. Level Up
              </h3>
              <p className="text-gray-600">
                Join the video call and get personalized advice to accelerate your career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories */}
      <section id="solutions" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">
            Explore Categories
          </h2>
          <p className="text-gray-600 mb-12">
            Mentorship for every step of your professional journey.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Software Engineering", icon: "💻" },
              { name: "UX/UI Design", icon: "🎨" },
              { name: "Marketing", icon: "📊" },
              { name: "Data Science", icon: "📈" }
            ].map((category, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-lg hover:shadow-lg transition-shadow cursor-pointer text-center"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Experts */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Featured Experts
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Rivera",
                title: "Product Lead at Tech Corp",
                sessions: "200+ Sessions",
                price: "$120",
                image: "bg-gradient-to-br from-slate-600 to-slate-800"
              },
              {
                name: "Sarah Chen",
                title: "Design Director at Creative Co",
                sessions: "150+ Sessions",
                price: "$100",
                image: "bg-gradient-to-br from-teal-500 to-teal-700"
              },
              {
                name: "Marcus Thorne",
                title: "VP Engineering at StartUp Inc",
                sessions: "180+ Sessions",
                price: "$150",
                image: "bg-gradient-to-br from-green-400 to-green-600"
              }
            ].map((expert, idx) => (
              <div key={idx} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <div className={`${expert.image} h-48 flex items-center justify-center text-white text-4xl font-bold`}>
                  {expert.name[0]}
                </div>
                <div className="p-6">
                  <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded mb-3">
                    Verified Expert
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {expert.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {expert.title}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                    <span>{expert.sessions}</span>
                    <span className="text-yellow-400">★★★★★</span>
                  </div>
                  <Link href="/login">
                    <button className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition-colors">
                      Book Session • {expert.price}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "How do I book a session?",
                a: "Choose a mentor, select an available time slot, complete the payment, and you're all set. You'll receive session details instantly."
              },
              {
                q: "Who are the mentors on the platform?",
                a: "All mentors go through a verification process to ensure quality, expertise, and authenticity."
              },
              {
                q: "What devices are supported?",
                a: "You can join sessions from desktop, tablet, or mobile using a modern browser."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg">
                <button className="w-full flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 text-left">
                    {faq.q}
                  </h3>
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                <p className="text-gray-600 mt-3">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-orange-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to boost your career?
          </h2>
          <p className="text-lg mb-8 text-orange-100">
            Join 10,000+ professionals getting career advice from industry experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-3 text-lg h-auto">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">OC</span>
                </div>
                <span className="font-bold text-white">OpenCall</span>
              </div>
              <p className="text-sm">Democratizing mentorship by connecting experts with professionals.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Browse Experts</a></li>
                <li><a href="#" className="hover:text-white">Become a Mentor</a></li>
                <li><a href="/about" className="hover:text-white">About</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Join Us</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Apply as Expert</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
            <p>&copy; 2024 OpenCall. All rights reserved.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 
