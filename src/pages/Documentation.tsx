import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, ExternalLink, ChevronUp } from "lucide-react";
import Button from "../components/ui/Button";

interface DocSection {
  id: string;
  title: string;
  content: string;
}

const documentationSections: DocSection[] = [
  {
    id: "welcome",
    title: "Welcome to Stylsia",
    content: `At Stylsia, we're building a next-generation fashion discovery platform that helps users find the most stylish and affordable products from multiple brands in one place.

We believe that great fashion should be easy to discover — and that your brand deserves to be seen.

## Limited-Time Offer: 3 Months Commission-Free Partnership

**For the first three months after Stylsia's official launch, we are offering a completely commission-free partnership.**

This means:
- You pay **0% commission** on any sale made through Stylsia during this period
- You get full access to our platform features and monthly performance insights
- You get to evaluate Stylsia's impact with **no upfront cost or risk**

*This special offer is only valid for 3 months from the date of launch. After that, our standard partner terms will apply.*`,
  },
  {
    id: "what-is-stylsia",
    title: "What Is Stylsia?",
    content: `Stylsia is an online platform that brings together a wide range of fashion products from different brands into a single destination. Think of it as a fashion search engine where users can:

- **Explore trendy clothes and accessories**
- **Compare prices across different brands**
- **Discover products tailored to their style and budget**

Your brand's products will be visible to our entire user base — without needing to manage a separate storefront.`,
  },
  {
    id: "why-partner",
    title: "Why Partner with Stylsia?",
    content: `Here's what your brand gets:

**Free Exposure:** Your products will be showcased to thousands of shoppers daily

**No Manual Work:** We handle the entire data sync process for you

**Brand Control:** You maintain your existing website, prices, and checkout flow

**Performance Tracking:** Get regular reports on views, clicks, and customer interest

**Early Partner Advantage:** Be part of our core launch group for maximum visibility

**Professional Integration:** Seamless product discovery and smart syncing technology`,
  },
  {
    id: "how-it-works",
    title: "How It Works",
    content: `We've designed our system to make it simple and seamless for brands like yours. Here's how it works:

## 1. Product Discovery
We automatically discover your product listings directly from your website.

## 2. Smart Syncing
We keep your product details (like prices, images, sizes, and stock) updated regularly — no need for you to send files or manage integrations.

## 3. Customer Redirection
When a user wants to buy a product, they're taken directly to your official website to complete the purchase.

## 4. Insights & Reporting
Every month, you'll receive a report that shows how your products are performing on Stylsia — including traffic, clicks, and trends.`,
  },
  {
    id: "requirements",
    title: "What We Need From You",
    content: `To get started, we only need:

- **Your brand name and website link**
- **Confirmation of your partnership interest**
- **Optional:** A point of contact (email or phone) for updates and support

**That's it.** No technical setup, no API keys, no hassle.

## Technical Benefits

**Automated Integration:** Our advanced scraping technology handles all data extraction

**Real-time Updates:** Product information stays current automatically

**Secure & Reliable:** Enterprise-grade security and 99.9% uptime guarantee

**Scalable Solution:** Grows with your brand as you add more products`,
  },
  {
    id: "partnership",
    title: "Ready to Partner?",
    content: `We're excited to help your brand grow and reach new customers through our innovative platform.

## Get Started Today

**Contact us for onboarding assistance: partners@stylsia.com**

Our partnership team will guide you through the simple onboarding process and answer any questions you may have.

## What Happens Next?

1. **Initial Contact:** Reach out to our partnership team

2. **Quick Setup:** We'll configure your brand profile (takes 24-48 hours)

3. **Product Discovery:** Our system automatically finds and syncs your products

4. **Launch:** Your products go live on Stylsia

5. **Monthly Reports:** Track your performance and growth

**Let's make fashion discovery better — together.**`,
  },
  {
    id: "important",
    title: "Important Information",
    content: `## Terms & Conditions

**Limited-Time Offer:** This onboarding document and commission-free offer are valid only within the first 3 months after Stylsia's launch date.

**Terms May Change:** Standard terms and conditions will apply after the promotional period ends.

**Data Security:** Your brand data is protected with enterprise-grade security measures.

**Support:** Dedicated partnership support is available throughout the onboarding process and beyond.

**Quality Assurance:** All products are reviewed to ensure they meet our platform standards.

## Contact Information

For questions, support, or partnership inquiries:
- **Email:** partners@stylsia.com
- **Subject Line:** "Partnership Inquiry - [Your Brand Name]"
- **Response Time:** 24 hours

*This offer is exclusively for qualifying fashion brands and may be subject to approval.*`,
  },
];

export default function Documentation() {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Track scroll position for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      // Show/hide scroll to top button
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper function to render markdown-like text with bold formatting and emoji support
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const content = part.slice(2, -2);
        // Check if it's an email
        if (content.includes("@stylsia.com")) {
          return (
            <a
              key={index}
              href={`mailto:${content}`}
              className="font-semibold text-primary-600 hover:text-primary-700 underline transition-colors duration-200"
            >
              {content}
            </a>
          );
        }
        return (
          <strong key={index} className="font-semibold text-gray-900">
            {content}
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
                onClick={() => navigate("/")}
              />{" "}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-primary-600">
                    Partner Onboarding Guide
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                    Join Stylsia's Exclusive Launch Partnership Program
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                icon={ArrowLeft}
                onClick={() => navigate("/")}
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
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-primary-50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-600 mb-1">
                    Stylsia Partner Onboarding Guide
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Join our exclusive launch partnership program with 3 months
                    commission-free benefits
                  </p>
                </div>
              </div>

              {/* Special Offer Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium shadow-sm">
                Limited-Time Offer: 3 Months Commission-Free Partnership
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {documentationSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 relative"
                >
                  {/* Add visual separator for better organization */}
                  {section.id !== "welcome" && (
                    <div className="absolute -top-3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                      {section.title}
                    </h2>
                  </div>

                  <div className="prose prose-gray max-w-none text-sm sm:text-base">
                    {section.content.split("\n\n").map((paragraph, index) => {
                      if (paragraph.startsWith("##")) {
                        return (
                          <h3
                            key={index}
                            className="text-lg font-semibold text-gray-900 mt-6 mb-3 flex items-center"
                          >
                            <span className="w-1 h-6 bg-primary-600 rounded-full mr-3"></span>
                            {paragraph.replace("## ", "")}
                          </h3>
                        );
                      }

                      if (
                        paragraph.startsWith("**") &&
                        paragraph.endsWith("**")
                      ) {
                        return (
                          <div
                            key={index}
                            className="bg-primary-50 border-l-4 border-primary-600 p-4 mb-4 rounded-r-lg"
                          >
                            <h4 className="font-semibold text-primary-900 mb-2">
                              {paragraph.slice(2, -2)}
                            </h4>
                          </div>
                        );
                      }

                      if (paragraph.startsWith("-")) {
                        const items = paragraph
                          .split("\n- ")
                          .map((item) => item.replace(/^- /, ""));
                        return (
                          <ul key={index} className="space-y-3 mb-6">
                            {items.map((item, itemIndex) => (
                              <li
                                key={itemIndex}
                                className="flex items-start text-gray-700"
                              >
                                <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                <span className="leading-relaxed">
                                  {renderFormattedText(item)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      // Special formatting for email addresses
                      if (paragraph.includes("@stylsia.com")) {
                        return (
                          <div
                            key={index}
                            className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4"
                          >
                            <p className="text-gray-700 leading-relaxed">
                              {renderFormattedText(paragraph)}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <p
                          key={index}
                          className="text-gray-700 mb-4 leading-relaxed"
                        >
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="w-1 h-6 bg-primary-600 rounded-full mr-3"></span>
                    Ready to Get Started?
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Join our exclusive launch partnership program and start
                    growing your brand with Stylsia.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-primary-600">
                    <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                    <span className="font-medium">
                      Partnership team available now
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Button
                    variant="primary"
                    icon={ExternalLink}
                    onClick={() =>
                      window.open(
                        "mailto:partners@stylsia.com?subject=Partnership%20Inquiry%20-%20[Your%20Brand%20Name]&body=Hi%20Stylsia%20Team,%0D%0A%0D%0AI%27m%20interested%20in%20joining%20your%20commission-free%20partnership%20program.%0D%0A%0D%0ABrand%20Name:%0D%0AWebsite:%0D%0AContact%20Person:%0D%0A%0D%0APlease%20let%20me%20know%20the%20next%20steps.%0D%0A%0D%0AThank%20you!",
                        "_blank"
                      )
                    }
                    size="sm"
                    className="bg-primary-600 hover:bg-primary-700 transition-all duration-200"
                  >
                    <span className="hidden sm:inline">Start Partnership</span>
                    <span className="sm:hidden">Partner Now</span>
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
