import React from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GameSEOProps {
  gameName: string;
  description: string;
  howToPlay: string[];
  features: string[];
  faqs: FAQItem[];
}

export default function GameSEO({
  gameName,
  description,
  howToPlay,
  features,
  faqs,
}: GameSEOProps) {
  return (
    <div className="mt-20 max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Play {gameName}</h2>
        <div className="prose text-gray-600">
          <p>{description}</p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            {howToPlay.map((step, index) => {
              const parts = step.split(":");
              if (parts.length > 1) {
                return (
                  <li key={index}>
                    <strong>{parts[0]}:</strong>{parts.slice(1).join(":")}
                  </li>
                );
              }
              return <li key={index}>{step}</li>;
            })}
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Features</h2>
        <ul className="list-disc pl-5 text-gray-600 space-y-2">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions (FAQ)</h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index}>
              <h3 className="text-lg font-bold text-gray-900">{faq.question}</h3>
              <p className="text-gray-600 mt-1">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
