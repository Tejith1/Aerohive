"use client"

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  pageName: string;
  customFAQs?: FAQ[];
}

const defaultFAQs: FAQ[] = [
  {
    question: "How do I get started with AeroHive?",
    answer: "You can start by creating an account and browsing our professional drone collection. If you're a pilot, you can register to join our network."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We provide 24/7 technical support, training programs, and maintenance services for all our drone models."
  },
  {
    question: "Are there any warranty options?",
    answer: "Yes, all our professional drones come with a comprehensive 1-year warranty and optional extended coverage plans."
  }
];

export function FAQSection({ pageName, customFAQs }: FAQSectionProps) {
  const faqs = customFAQs || defaultFAQs;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    doubt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: `Doubt from ${pageName}`,
          message: formData.doubt,
          priority: 'normal',
          department: 'Customer Support'
        })
      });

      if (response.ok) {
        toast({
          title: "Doubt Sent! ✅",
          description: "We've received your question and will get back to you shortly.",
        });
        setFormData({ name: '', email: '', doubt: '' });
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send your doubt. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/40 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mb-4">
            <HelpCircle className="h-4 w-4" />
            <span>Support Center</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find quick answers to common questions about {pageName.toLowerCase()} or ask us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="group border border-gray-200 rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-200"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                    {faq.question}
                  </span>
                  <div className={`transform transition-transform duration-300 bg-gray-50 p-2 rounded-xl text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 ${openIndex === index ? 'rotate-180 text-blue-600 bg-blue-50' : ''}`}>
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>
                <div 
                  className={`px-6 transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Ask a Doubt Form */}
          <div className="lg:sticky lg:top-32">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden p-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-5"></div>
              <CardContent className="p-8 relative">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg text-white">
                    <HelpCircle className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Still have a Doubt?</h3>
                    <p className="text-gray-500">Ask us anything about this section.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="rounded-xl border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="rounded-xl border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type your question or doubt here..."
                      value={formData.doubt}
                      onChange={(e) => setFormData({ ...formData, doubt: e.target.value })}
                      required
                      className="rounded-xl border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[120px] resize-none"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Submit Question</span>
                        <Send className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
