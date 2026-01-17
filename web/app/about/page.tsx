"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Twitter } from "lucide-react"

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">OC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">OpenCall</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="/#solutions" className="text-gray-600 hover:text-gray-900">Solutions</a>
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

      {/* About Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            About OpenCall
          </h1>
          <p className="text-xl text-gray-600">
            Democratizing mentorship by connecting industry experts with professionals worldwide.
          </p>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Meet the Creator
          </h2>
          
          <div className="bg-white border border-gray-200 rounded-xl p-8 md:p-12 shadow-lg">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Developer Image */}
              <div className="flex-shrink-0">
                <Image
                  src="/dev.png"
                  alt="Preet Singh"
                  width={200}
                  height={200}
                  className="rounded-lg object-cover"
                />
              </div>

              {/* Developer Info */}
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Preet Singh
                </h3>
                <p className="text-orange-500 font-semibold mb-4">
                  Full Stack Developer &amp; Creator
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Passionate about building innovative solutions that connect people and create meaningful opportunities. 
                  Preet Singh is the developer behind OpenCall, a platform designed to democratize access to expert mentorship 
                  and professional guidance. With expertise in full-stack development and a commitment to creating impactful products, 
                  Preet continues to refine and expand OpenCall's capabilities.
                </p>

                {/* Social Links */}
                <div className="flex gap-4 mb-8">
                  <a
                    href="https://www.linkedin.com/in/preet-singh-a65967302/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                  >
                    <Linkedin size={20} />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://x.com/RaOne_0xDev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Twitter size={20} />
                    <span>Twitter/X</span>
                  </a>
                  <a
                    href="https://github.com/preetsinghmakkar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                  >
                    <Github size={20} />
                    <span>GitHub</span>
                  </a>
                </div>

                <p className="text-sm text-gray-500">
                  Questions or feedback? We'd love to hear from you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Vision
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Accessibility</h3>
              <p className="text-gray-600 text-sm">
                Making expert guidance and mentorship accessible to everyone, regardless of background or location.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Connection</h3>
              <p className="text-gray-600 text-sm">
                Building authentic connections between industry experts and professionals seeking guidance.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Growth</h3>
              <p className="text-gray-600 text-sm">
                Empowering career growth through real conversations and actionable insights from industry leaders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Connect with Experts?
          </h2>
          <p className="text-lg mb-8 text-orange-100">
            Start your mentorship journey today with OpenCall.
          </p>
          <Link href="/login">
            <Button className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-3 text-lg h-auto font-semibold">
              Book a Call Now →
            </Button>
          </Link>
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
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.linkedin.com/in/preet-singh-a65967302/" target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a></li>
                <li><a href="https://x.com/RaOne_0xDev" target="_blank" rel="noopener noreferrer" className="hover:text-white">Twitter/X</a></li>
                <li><a href="https://github.com/preetsinghmakkar" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a></li>
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
