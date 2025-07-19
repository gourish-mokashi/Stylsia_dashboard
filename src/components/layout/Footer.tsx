import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email subscription logic here
    console.log('Email subscription:', email);
    setEmail('');
  };

  const footerSections = {
    shop: {
      title: 'Shop Now',
      items: [
        { label: 'Women', action: () => navigate('/products?category=Women') },
        { label: 'Men', action: () => navigate('/products?category=Men') },
        { label: 'Kids', action: () => navigate('/products?category=Kids') },
        { label: 'All Products', action: () => navigate('/products') },
      ]
    },
    support: {
      title: 'Support',
      items: [
        { label: 'Contact Us', action: () => navigate('/messages') },
        { label: 'FAQ', action: () => navigate('/documentation') },
        { label: 'Become a Partner', action: () => navigate('/documentation') },
      ]
    },
    follow: {
      title: 'Follow Us',
      items: [
        { label: 'Instagram', action: () => window.open('https://www.instagram.com/stylsia/?hl=en', '_blank') },
      ]
    }
  };

  return (
    <footer className="bg-[#0d9488] text-white">
      {/* Newsletter Section */}
      <div className="px-4 py-12 md:py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Stay in the know
          </h2>
          <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Get the latest fashion trends and exclusive offers delivered to your inbox.
          </p>
          
          <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 bg-transparent border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-white/70 text-white"
                required
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:scale-110 transition-transform text-white"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Logo and Description Section */}
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="border-t border-white/20 pt-8">
            <p className="text-base md:text-lg leading-relaxed max-w-4xl mx-auto">
              Your destination for the latest fashion trends and timeless classics.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Accordion Navigation */}
      <div className="md:hidden px-4 pb-8">
        <div className="max-w-7xl mx-auto space-y-2">
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key} className="border-b border-white/20">
              <button
                onClick={() => toggleAccordion(key)}
                className="w-full flex items-center justify-between py-4 text-left font-semibold text-lg hover:opacity-80 transition-opacity text-white"
              >
                <span>{section.title}</span>
                <motion.div
                  animate={{ rotate: openAccordion === key ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openAccordion === key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 pl-4">
                      {section.items.map((item, index) => (
                        <button
                          key={index}
                          onClick={item.action}
                          className="block w-full text-left py-2 text-white/80 hover:text-white transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-8">
            {Object.entries(footerSections).map(([key, section]) => (
              <div key={key}>
                <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.items.map((item, index) => (
                    <li key={index}>
                      <button
                        onClick={item.action}
                        className="text-white/80 hover:text-white transition-colors text-left"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="px-4 py-6 border-t border-white/20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-white/70">
            © 2025 Stylsia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
