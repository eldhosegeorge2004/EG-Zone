/* eslint-disable */
"use client";

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Get in Touch</h1>
        <p className="text-gray-600 text-lg font-medium">
          Have a game suggestion, found a bug, or just want to say hi? Send us a message!
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xl shadow-gray-200/50">
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Name</label>
              <input 
                type="text" 
                id="name" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                id="email" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
            <input 
              type="text" 
              id="subject" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
              placeholder="Game Suggestion"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">Message</label>
            <textarea 
              id="message" 
              rows={5}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all resize-none"
              placeholder="Tell us what's on your mind..."
            ></textarea>
          </div>

          <button 
            type="button"
            onClick={() => alert("Thank you for your message! We will get back to you soon.")}
            className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 text-lg"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
