import React from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface SupportFAQProps {
  faqs?: FAQItem[];
}

export default function SupportFAQ({ faqs }: SupportFAQProps) {
  const defaultFaqs: FAQItem[] = [
    {
      question: "How quickly will I receive a response?",
      answer:
        "We aim to respond to all support requests within 24 hours during business days. High priority issues are typically addressed within 4-8 hours.",
    },
    {
      question: "What information should I include in my request?",
      answer:
        "Please include as much detail as possible about your issue, including any error messages, steps to reproduce, and relevant screenshots or files.",
    },
    {
      question: "How do I check the status of my support request?",
      answer:
        "All updates to your support request will be sent to your registered email address. You can reply directly to these emails to add more information.",
    },
    {
      question: "What if my issue is urgent?",
      answer:
        'For urgent issues, please select "High" priority when submitting your request.',
    },
  ];

  const displayFaqs = faqs || defaultFaqs;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        {displayFaqs.map((faq, index) => (
          <div
            key={index}
            className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
          >
            <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
            <p className="text-gray-600 text-sm">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
