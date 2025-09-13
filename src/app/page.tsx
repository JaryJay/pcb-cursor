'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, ArrowRight, Zap, Layers, Download, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <Cpu className="h-16 w-16 text-blue-600" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Breadboard Designer
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Design circuits visually, get auto-placement on breadboards, and generate 
              LEGO-style assembly instructions for hobby electronics projects.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/editor"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center gap-2"
              >
                Open Editor <ArrowRight className="h-5 w-5" />
              </Link>
              
              <Link
                href="/demo"
                className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to design circuits
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From schematic capture to physical assembly, we've got you covered with 
            professional-grade tools and beginner-friendly instructions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Cpu className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Visual Design</h3>
            <p className="text-gray-600">
              Drag and drop components from our comprehensive parts library onto your breadboard design.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Auto Routing</h3>
            <p className="text-gray-600">
              Intelligent placement and routing algorithms optimize your circuit layout automatically.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Layers className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Step Instructions</h3>
            <p className="text-gray-600">
              LEGO-style assembly instructions with highlighting and callouts for easy building.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Download className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Options</h3>
            <p className="text-gray-600">
              Export as PDF instructions, SVG diagrams, PNG images, or CSV bill of materials.
            </p>
          </div>
        </div>
      </div>

      {/* Example Circuits Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Start with Example Circuits
            </h2>
            <p className="text-lg text-gray-600">
              Jump right in with these popular beginner-friendly projects
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 rounded-lg w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-8 w-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic LED Circuit</h3>
                  <p className="text-gray-600 mb-4">
                    Simple LED with current-limiting resistor and power supply. Perfect for beginners.
                  </p>
                  <div className="flex gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">LED</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Resistor</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Power</span>
                  </div>
                  <Link
                    href="/editor?example=led-circuit"
                    className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                  >
                    Open Circuit <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-100 rounded-lg w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <Cpu className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">555 Timer Blinker</h3>
                  <p className="text-gray-600 mb-4">
                    Classic astable 555 timer circuit that blinks an LED. Great for learning timing circuits.
                  </p>
                  <div className="flex gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">NE555</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">LED</span>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">Capacitor</span>
                  </div>
                  <Link
                    href="/editor?example=555-blinker"
                    className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                  >
                    Open Circuit <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Professional Features for Everyone
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Whether you're a student, maker, or engineer, our tools help you design 
              and build circuits with confidence.
            </p>

            <div className="space-y-4">
              {[
                'Comprehensive parts library with popular components',
                'Automatic component placement and wire routing',
                'Design rule checks to prevent common mistakes',
                'LEGO-style step-by-step assembly instructions',
                'Export to PDF, SVG, PNG, and CSV formats',
                'Keyboard shortcuts for fast workflow',
                'Undo/redo with unlimited history',
                'Responsive design works on all devices'
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <div className="bg-blue-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Cpu className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first circuit in minutes with our intuitive drag-and-drop interface.
            </p>
            <Link
              href="/editor"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              Launch Editor <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Cpu className="h-6 w-6" />
              <span className="text-lg font-semibold">Breadboard Designer</span>
            </div>
            <p className="text-gray-400">
              Built with ❤️ by HTN 2025 Team. Made for makers, students, and engineers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
