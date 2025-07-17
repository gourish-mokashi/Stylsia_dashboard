import React, { useState, useEffect } from "react";
import {
  Save,
  Globe,
  Mail,
  Phone,
  Building,
  AlertCircle,
  CheckCircle,
  Calendar,
  Tag,
  FileText,
} from "lucide-react";
import Header from "../components/layout/Header";
import Button from "../components/ui/Button";
import LogoUpload from "../components/profile/LogoUpload";
import { useBrandData } from "../hooks/useBrandData";

export default function Profile() {
  const { brand, loading, error, updateBrand } = useBrandData();
  const [formData, setFormData] = useState({
    brandName: "",
    description: "",
    website: "",
    contactEmail: "",
    contactPhone: "",
    businessAddress: "",
    businessType: "Fashion & Apparel",
    foundedYear: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Update form data when brand data loads
  useEffect(() => {
    if (brand) {
      setFormData({
        brandName: brand.name || "",
        description: brand.description || "",
        website: brand.website || "",
        contactEmail: brand.contact_email || "",
        contactPhone: brand.contact_phone || "",
        businessAddress: brand.business_address || "",
        businessType: brand.business_type || "Fashion & Apparel",
        foundedYear: brand.founded_year ? brand.founded_year.toString() : "",
      });
    }
  }, [brand]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear success message when user starts editing
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };

  const handleLogoUploadSuccess = async (logoUrl: string) => {
    try {
      await updateBrand({ logo_url: logoUrl });
      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating logo:", error);
      setUploadError("Failed to update brand with new logo");
    }
  };

  const handleLogoUploadError = (error: string) => {
    setUploadError(error);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateBrand({
        name: formData.brandName,
        description: formData.description,
        website: formData.website,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        business_address: formData.businessAddress,
        business_type: formData.businessType,
        founded_year: formData.foundedYear
          ? parseInt(formData.foundedYear)
          : undefined,
      });

      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      // Error is handled by the hook and displayed in the error state
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container-responsive py-4 sm:py-6">
        <Header
          title="Brand Profile"
          subtitle="Manage your essential brand information"
        />

        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container-responsive py-4 sm:py-6">
        <Header
          title="Brand Profile"
          subtitle="Manage your essential brand information"
        />

        <div className="mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Failed to Load Profile
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-4 sm:py-6">
      <Header
        title="Brand Profile"
        subtitle="Manage your essential brand information"
      />

      <div className="mt-6 space-y-6">
        {/* Brand Information Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Building className="h-5 w-5 mr-2 text-primary-600" />
            Brand Information
          </h3>

          {/* Success message */}
          {saveSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">
                Profile updated successfully!
              </p>
            </div>
          )}

          {/* Upload error message */}
          {uploadError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{uploadError}</p>
            </div>
          )}

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {/* Logo Upload */}
            <LogoUpload
              currentLogoUrl={brand?.logo_url}
              brandName={brand?.name}
              onUploadSuccess={handleLogoUploadSuccess}
              onUploadError={handleLogoUploadError}
            />

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="brandName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Brand Name *
                </label>
                <input
                  type="text"
                  id="brandName"
                  name="brandName"
                  required
                  value={formData.brandName}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Brand name can only be changed by contacting support.
                </p>
              </div>

              <div>
                <label
                  htmlFor="businessType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Business Type
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  value="Fashion & Apparel"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                >
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Brand Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tell customers about your brand, mission, and what makes you unique..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This description will be visible to customers browsing your
                products.
              </p>
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-primary-600" />
                Contact Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="contactEmail"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contact Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      required
                      value={formData.contactEmail}
                      disabled
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Contact email can only be changed by contacting support.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-4 w-4 mr-2 text-primary-600" />
                Business Details
              </h4>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Website URL *
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      id="website"
                      name="website"
                      required
                      value={formData.website}
                      disabled
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      placeholder="https://yourbrand.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Website URL can only be changed by contacting support.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="foundedYear"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        Founded Year
                      </div>
                    </label>
                    <input
                      type="number"
                      id="foundedYear"
                      name="foundedYear"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.foundedYear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="businessAddress"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        Business Address
                      </div>
                    </label>
                    <input
                      type="text"
                      id="businessAddress"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Street address, City, State, ZIP"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-primary-600" />
                Account Status
              </h4>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <Tag className="h-4 w-4 mr-2 text-gray-500" />
                      <p className="text-sm font-medium text-gray-700">
                        Status
                      </p>
                    </div>
                    <p className="text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          brand?.status === "active"
                            ? "bg-green-100 text-green-800"
                            : brand?.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : brand?.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {brand?.status === "active"
                          ? "Active"
                          : brand?.status === "pending"
                          ? "Pending Approval"
                          : brand?.status === "suspended"
                          ? "Suspended"
                          : brand?.status === "inactive"
                          ? "Inactive"
                          : "Unknown"}
                      </span>
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <p className="text-sm font-medium text-gray-700">
                        Member Since
                      </p>
                    </div>
                    <p className="text-sm text-gray-900">
                      {brand?.created_at
                        ? new Date(brand.created_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      <p className="text-sm font-medium text-gray-700">
                        Last Updated
                      </p>
                    </div>
                    <p className="text-sm text-gray-900">
                      {brand?.updated_at
                        ? new Date(brand.updated_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button
                type="submit"
                icon={Save}
                loading={saving}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Profile Tips
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              • <strong>Complete your profile:</strong> A complete profile helps
              customers trust your brand and improves discoverability.
            </p>
            <p>
              • <strong>High-quality logo:</strong> Upload a clear, professional
              logo that represents your brand identity.
            </p>
            <p>
              • <strong>Compelling description:</strong> Write a description
              that highlights what makes your brand unique and appealing to
              customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
