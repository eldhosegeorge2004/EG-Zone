/* eslint-disable */
import { Info, Code, Rocket, Heart, Shield, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-6">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">EG ZONE</span>
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed font-medium max-w-2xl mx-auto">
          EG ZONE is a premier online gaming platform dedicated to providing free, high-quality, and instantly accessible mini-games for players around the world.
        </p>
      </div>

      <div className="space-y-12">
        <section className="flex flex-col md:flex-row gap-8 items-start bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl shrink-0">
            <Rocket className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Founded in 2024, EG ZONE was built with a simple goal: to make gaming accessible to everyone, regardless of their device or location. We believe that fun shouldn't require massive downloads, expensive hardware, or lengthy sign-up processes. We focus on curating and developing quick, challenging mini-games that test your reflexes, improve your cognitive skills, and provide instant entertainment.
            </p>
          </div>
        </section>

        <section className="flex flex-col md:flex-row gap-8 items-start bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl shrink-0">
            <Users className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Who We Are</h2>
            <p className="text-gray-600 leading-relaxed">
              EG ZONE is developed by a passionate team of web developers and game designers who grew up during the golden era of flash games. We wanted to recapture that magic using modern web technologies. Our team is dedicated to continuous improvement, regularly updating our existing catalog, and releasing new games based on community feedback.
            </p>
          </div>
        </section>

        <section className="flex flex-col md:flex-row gap-8 items-start bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl shrink-0">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Commitment to Quality & Safety</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We take pride in offering a safe, family-friendly environment. Every game on our platform goes through rigorous testing to ensure it runs smoothly, is free of bugs, and contains appropriate content. Furthermore, we are committed to user privacy and secure data handling, ensuring your gaming experience is worry-free.
            </p>
          </div>
        </section>

        <section className="flex flex-col md:flex-row gap-8 items-start bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl shrink-0">
            <Code className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">The Tech Stack</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              EG ZONE is built using cutting-edge web technologies to ensure lightning-fast performance and a seamless user experience across all devices, from powerful desktops to older smartphones.
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-600 font-medium mt-6">
              <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span> Next.js 15</li>
              <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span> React 19</li>
              <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span> TypeScript</li>
              <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span> Tailwind CSS v4</li>
              <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span> HTML5 Canvas</li>
              <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span> Vercel Hosting</li>
            </ul>
          </div>
        </section>

        <section className="flex flex-col md:flex-row gap-8 items-start bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-2xl shrink-0">
            <Heart className="w-8 h-8 text-pink-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Community First</h2>
            <p className="text-gray-600 leading-relaxed">
              This platform is for you. We plan to add a new game every week based on community feedback. If you have an idea for a game you'd like to see, or if you spot a bug, don't hesitate to reach out via our Contact page!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
