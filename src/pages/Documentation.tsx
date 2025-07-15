import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ExternalLink, Copy, Check, Printer, Download, ChevronUp } from 'lucide-react';
import Button from '../components/ui/Button';

interface DocSection {
  id: string;
  title: string;
  content: string;
}

const documentationSections: DocSection[] = [
  {
    id: 'overview',
    title: '1. Business Model Overview',
    content: `Stylsia offers a partner platform designed to seamlessly integrate independent and emerging brands into our curated fashion marketplace. Brands supply their digital presence, and Stylsia's internal team takes responsibility for extracting and preparing their full product catalogs. 

Brands do not need to run any backend scripts—that responsibility is handled entirely by Stylsia—and they receive fully featured, verified product data ready for display and sale.`
  },
  {
    id: 'how-it-works',
    title: '2. How It Works',
    content: `## a) Brand Onboarding

**Configuration:** Stylsia team uses a simple CLI to register brand details: website domain, product sitemap or sample URL, and preferred scraping method.

**Sitemap Discovery:** We automatically scan for sitemaps or parse robots.txt to extract all product URLs.

## b) Data Extraction and Processing

**Dual Extraction Methods:**
- JSON API-based extraction when available (e.g., structured endpoints)
- HTML parsing based on product page content otherwise

**Compression Handling:** Supports Brotli, Gzip, and Zlib content encoding.

**Raw and Processed Storage:**
- Maintains original API or page content for audit and debugging
- Cleans and structures information into CSV and database-formatted product entries

## c) Supabase Integration

**Database Ingestion:** Processed data is inserted into Supabase, where it becomes accessible via Stylsia's dashboards, enabling product review, approval, and listing.

**Secure Schema & Policies:** Database schema designed for reliability and performance; access is restricted to Stylsia's internal tools.

**Operational Tools:** A suite of CLI tools (main.py, universal_scraper_runner.py, csv_to_supabase_importer.py, etc.) handle configuration, execution, data exports, and diagnostics.`
  },
  {
    id: 'benefits',
    title: '3. Key Benefits',
    content: `**Zero Effort for Brands:** Stylsia's team handles all scraping, cleanup, and uploads.

**Fully Featured Product Data:** Images, descriptions, pricing, variants, and metadata are extracted and verified.

**Brand-Specific Flexibility:** Scraping modules can be quickly tailored to fit different website structures.

**Operational Transparency:** Raw data is preserved, and logs are generated for auditing or quality assurance.`
  },
  {
    id: 'summary',
    title: 'Summary',
    content: `Stylsia's backend ensures brand catalogs are live and accurate with minimal effort from partners. Stylsia manages the technical pipeline—from data discovery to database integration—while brands benefit from ready-to-use product listings in their merchant dashboards. 

This platform is both technically robust and operationally seamless.

For any questions about printed overview materials, deployment schedules, or technical diagrams for internal review, please contact our support team.`
  }
];

export default function Documentation() {
  const navigate = useNavigate();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleCopySection = async (sectionId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const fullContent = documentationSections.map(section => 
      `${section.title}\n\n${section.content}`
    ).join('\n\n---\n\n');
    
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stylsia-backend-documentation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Track scroll position for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      // Show/hide scroll to top button
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to render markdown-like text with bold formatting
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { background: white !important; }
          .bg-gray-50, .bg-white, .bg-primary-50 { background: white !important; }
          .border, .shadow-sm { border: 1px solid #ccc !important; box-shadow: none !important; }
          .text-primary-600, .text-primary-700 { color: #333 !important; }
        }
      `}</style>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-0 sm:h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/img/stylsiaLOGO-05.png" 
                alt="Stylsia" 
                className="h-8 w-auto cursor-pointer"
                onClick={() => navigate('/')}
              />
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Documentation</h1>
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Stylsia Backend: E-Commerce Data Integration</p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                icon={ArrowLeft}
                onClick={() => navigate('/')}
                className="shrink-0"
                size="sm"
              >
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Main Content */}
        <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Stylsia Backend: E-Commerce Data Integration
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Complete guide to understanding how Stylsia's backend system handles brand integration and product data management.
                </p>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                {documentationSections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-24"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {section.title}
                      </h2>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={copiedSection === section.id ? Check : Copy}
                        onClick={() => handleCopySection(section.id, section.content)}
                        className={`no-print self-start sm:self-auto ${copiedSection === section.id ? 'text-green-600 border-green-300' : ''}`}
                      >
                        {copiedSection === section.id ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    
                    <div className="prose prose-gray max-w-none text-sm sm:text-base">
                      {section.content.split('\n\n').map((paragraph, index) => {
                        if (paragraph.startsWith('##')) {
                          return (
                            <h3 key={index} className="text-lg font-medium text-gray-900 mt-6 mb-3">
                              {paragraph.replace('## ', '')}
                            </h3>
                          );
                        }
                        
                        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                          return (
                            <h4 key={index} className="font-medium text-gray-900 mb-2">
                              {paragraph.slice(2, -2)}
                            </h4>
                          );
                        }
                        
                        if (paragraph.startsWith('-')) {
                          const items = paragraph.split('\n- ').map(item => item.replace(/^- /, ''));
                          return (
                            <ul key={index} className="list-disc list-inside space-y-1 mb-4">
                              {items.map((item, itemIndex) => (
                                <li key={itemIndex} className="text-gray-700">
                                  {renderFormattedText(item)}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        
                        return (
                          <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                            {renderFormattedText(paragraph)}
                          </p>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 rounded-b-lg no-print">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Need more help?</h3>
                    <p className="text-sm text-gray-600">Contact our support team for additional assistance.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      icon={Printer}
                      onClick={handlePrint}
                      size="sm"
                    >
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      icon={Download}
                      onClick={handleDownload}
                      size="sm"
                    >
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/dashboard/messages')}
                      size="sm"
                    >
                      Support
                    </Button>
                    <Button
                      variant="outline"
                      icon={ExternalLink}
                      onClick={() => window.open('mailto:support@stylsia.com?subject=Documentation%20Inquiry', '_blank')}
                      size="sm"
                    >
                      <span className="hidden sm:inline">Email Support</span>
                      <span className="sm:hidden">Email</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 p-2 sm:p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 hover:scale-110 z-50 no-print"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      )}
    </div>
  );
}
