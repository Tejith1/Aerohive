"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <section className="py-24 bg-background border-t border-border overflow-hidden relative">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase font-mono">
              // SUPPORT_HUB
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-normal text-foreground tracking-tight leading-[1.1] font-display">
            Frequently Asked <span className="text-primary font-normal">Questions</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Find immediate answers regarding {pageName.toLowerCase()} or submit a direct inquiry to our flight engineering team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* FAQ Accordion Side */}
          <div className="lg:col-span-7 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index}
                  className="group border border-border rounded-2xl bg-card overflow-hidden transition-all duration-300 hover:shadow-sm"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left cursor-pointer border-0 bg-transparent"
                  >
                    <span className="font-medium text-base md:text-lg text-foreground group-hover:text-primary transition-colors pr-4 leading-snug font-display">
                      {faq.question}
                    </span>
                    <motion.div 
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      className={`p-2 rounded-xl text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 ${isOpen ? 'text-primary bg-primary/10' : ''}`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 border-t border-border pt-4">
                          <p className="text-muted-foreground leading-relaxed font-light text-sm md:text-base">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Form Side */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <Card className="border border-border bg-card shadow-sm rounded-3xl overflow-hidden p-1">
              <CardContent className="p-8 relative">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-normal text-foreground font-display tracking-tight">Still have Questions?</h3>
                    <p className="text-xs text-muted-foreground">Ask our flight technicians directly.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20 transition-all h-12 text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20 transition-all h-12 text-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Explain your telemetry or rig inquiry here..."
                      value={formData.doubt}
                      onChange={(e) => setFormData({ ...formData, doubt: e.target.value })}
                      required
                      className="rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20 transition-all min-h-[120px] resize-none text-foreground"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 bg-primary hover:bg-primary/95 text-white rounded-full text-sm font-semibold tracking-wide border-0 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <Send className="h-4 w-4" />
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
