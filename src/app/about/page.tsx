/* eslint-disable */
import { Info, Code, Rocket, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-6">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">EG ZONE</span>
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed font-medium">
          EG ZONE was built with a simple goal: provide a premium, fast, and fun platform for classic mini-games that test your skills, memory, and reflexes.
        </p>
      </div>

      <div className="space-y-12">
        <section className="flex flex-col md:flex-row gap-8 items-start">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl shrink-0 shadow-sm">
            <Rocket className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              We believe gaming shouldn't require massive downloads or high-end hardware. Sometimes, the best games are the simplest ones. We aim to bring you quick dopamine hits through challenging, competitive, and responsive mini-games.
            </p>
          </div>
        </section>

        <section className="flex flex-col md:flex-row gap-8 items-start">
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl shrink-0 shadow-sm">
            <Code className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">The Tech Stack</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              EG ZONE is built using modern web technologies to ensure lightning-fast performance and a seamless user experience across all devices.
            </p>
            <ul className="grid grid-cols-2 gap-4 text-sm text-gray-600 font-medium">
              <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span> Next.js 15</li>
              <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span> React 19</li>
              <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span> TypeScript</li>
              <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span> Tailwind CSS v4</li>
              <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span> HTML Canvas</li>
              <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span> Vercel</li>
            </ul>
          </div>
        </section>

        <section className="flex flex-col md:flex-row gap-8 items-start">
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-2xl shrink-0 shadow-sm">
            <Heart className="w-8 h-8 text-pink-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Community First</h2>
            <p className="text-gray-600 leading-relaxed">
              This platform is for you. We plan to add a new game every week based on community feedback. If you have an idea for a game you'd like to see, don't hesitate to contact us!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
