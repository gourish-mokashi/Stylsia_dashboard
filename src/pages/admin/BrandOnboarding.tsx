import React, { useState } from "react";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Globe,
  Link,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserPlus,
  Copy,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { supabase } from "../../lib/supabase";

interface BrandFormData {
  brandName: string;
  email: string;
  phone: string;
  website: string;
  sitemapUrl: string;
  description: string;
  contactPerson: string;
}

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function BrandOnboarding() {
  const [formData, setFormData] = useState<BrandFormData>({
    brandName: "",
    email: "",
    phone: "",
    website: "",
    sitemapUrl: "",
    description: "",
    contactPerson: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [generatedSignupUrl, setGeneratedSignupUrl] = useState<string>("");

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.brandName.trim()) {
      showNotification("error", "Brand name is required");
      return false;
    }
    if (!formData.email.trim()) {
      showNotification("error", "Email is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      showNotification("error", "Please enter a valid email address");
      return false;
    }
    if (!formData.phone.trim()) {
      showNotification("error", "Phone number is required");
      return false;
    }
    if (!formData.website.trim()) {
      showNotification("error", "Website URL is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Add brand to brands table first
      const { data: brandData, error: brandError } = await supabase
        .from("brands")
        .insert({
          name: formData.brandName,
          website: formData.website,
          description: formData.description,
          contact_email: formData.email,
          contact_phone: formData.phone,
          status: "pending",
        })
        .select()
        .single();

      if (brandError) {
        console.error("Brand creation error:", brandError);
        showNotification(
          "error",
          `Failed to create brand: ${brandError.message}`
        );
        return;
      }

      // Step 2: Add sitemap URL to brand metadata if needed
      if (formData.sitemapUrl) {
        // You can store this in brand description or create a separate metadata table
        await supabase
          .from("brands")
          .update({
            description: `${formData.description}\n\nSitemap URL: ${formData.sitemapUrl}`,
          })
          .eq("id", brandData.id);
      }

      // Step 3: Create an invite record (using support_requests table as a temporary solution)
      const inviteToken = `inv_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      try {
        // Create a support request record as an invite placeholder
        await supabase.from("support_requests").insert({
          subject: `Brand Invite: ${formData.brandName}`,
          description: `Invitation created for brand: ${formData.brandName}
Email: ${formData.email}
Contact Person: ${formData.contactPerson}
Website: ${formData.website}
Phone: ${formData.phone}
Invite Token: ${inviteToken}
Status: Pending Registration`,
          status: "new",
          priority: "medium",
        });
      } catch (inviteError) {
        console.warn("Could not create invite record:", inviteError);
        // Continue even if invite record creation fails
      }

      // Step 4: Create a signup URL for the brand
      const signupUrl = `${
        window.location.origin
      }/auth/signup?email=${encodeURIComponent(
        formData.email
      )}&brand=${encodeURIComponent(formData.brandName)}&token=${inviteToken}`;

      // Store the signup URL for display
      setGeneratedSignupUrl(signupUrl);

      // Show success message
      showNotification(
        "success",
        `Brand "${formData.brandName}" has been successfully onboarded! Check below for the signup link.`
      );

      // Reset form
      setFormData({
        brandName: "",
        email: "",
        phone: "",
        website: "",
        sitemapUrl: "",
        description: "",
        contactPerson: "",
      });

      // Don't clear the signup URL so admin can still copy it
    } catch (error) {
      console.error("Unexpected error:", error);
      showNotification(
        "error",
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg border animate-slide-up ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center space-x-2">
              {notification.type === "success" && (
                <CheckCircle className="h-4 w-4" />
              )}
              {notification.type === "error" && (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {notification.message}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoBack}
            icon={ArrowLeft}
            className="mb-4 text-slate-600 hover:text-slate-900"
          >
            Back to Dashboard
          </Button>

          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Brand Onboarding
              </h1>
              <p className="text-slate-600 mt-1">
                Add a new brand partner to the platform
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Brand Information
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Please fill in all required information to onboard a new brand
              partner.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Brand Name */}
            <div>
              <label
                htmlFor="brandName"
                className="flex items-center text-sm font-medium text-slate-700 mb-2"
              >
                <Building className="h-4 w-4 mr-2" />
                Brand Name *
              </label>
              <input
                type="text"
                id="brandName"
                name="brandName"
                value={formData.brandName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter brand name"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label
                htmlFor="contactPerson"
                className="flex items-center text-sm font-medium text-slate-700 mb-2"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Contact Person
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter contact person's name"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="flex items-center text-sm font-medium text-slate-700 mb-2"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter email address"
              />
              <p className="text-xs text-slate-500 mt-1">
                An invitation link will be sent to this email address
              </p>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="flex items-center text-sm font-medium text-slate-700 mb-2"
              >
                <Phone className="h-4 w-4 mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter phone number"
              />
            </div>

            {/* Website */}
            <div>
              <label
                htmlFor="website"
                className="flex items-center text-sm font-medium text-slate-700 mb-2"
              >
                <Globe className="h-4 w-4 mr-2" />
                Website URL *
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="https://example.com"
              />
            </div>

            {/* Sitemap URL */}
            <div>
              <label
                htmlFor="sitemapUrl"
                className="flex items-center text-sm font-medium text-slate-700 mb-2"
              >
                <Link className="h-4 w-4 mr-2" />
                Sitemap Source URL
              </label>
              <input
                type="url"
                id="sitemapUrl"
                name="sitemapUrl"
                value={formData.sitemapUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="https://example.com/sitemap.xml"
              />
              <p className="text-xs text-slate-500 mt-1">
                Optional: Sitemap URL for product discovery
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium text-slate-700 mb-2 block"
              >
                Brand Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                placeholder="Enter a brief description of the brand..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoBack}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                icon={isSubmitting ? Loader2 : UserPlus}
                className={isSubmitting ? "animate-spin" : ""}
              >
                {isSubmitting ? "Creating Account..." : "Onboard Brand"}
              </Button>
            </div>
          </form>
        </div>

        {/* Signup URL Display */}
        {generatedSignupUrl && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-900">
                  Brand Signup Link Generated
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Share this link with the brand to complete their registration:
                </p>
                <div className="mt-3 flex items-center space-x-3">
                  <input
                    type="text"
                    value={generatedSignupUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm text-slate-900"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Copy}
                    onClick={() => {
                      navigator.clipboard.writeText(generatedSignupUrl);
                      showNotification(
                        "success",
                        "Signup link copied to clipboard!"
                      );
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                What happens next?
              </h3>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>
                  The brand will be created with "pending" status in the system
                </li>
                <li>A custom signup link will be generated for the brand</li>
                <li>
                  Share the signup link with the brand via email or other means
                </li>
                <li>The brand can register using the provided signup link</li>
                <li>Once verified, they can access their brand dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
