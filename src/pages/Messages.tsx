import React, { useState } from "react";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import Header from "../components/layout/Header";
import Button from "../components/ui/Button";
import SupportInfoCard from "../components/support/SupportInfoCard";
import EmailSupportForm from "../components/support/EmailSupportForm";
import SupportFAQ from "../components/support/SupportFAQ";
import { useSupportRequests } from "../hooks/useSupportRequests";
import { useBrandData } from "../hooks/useBrandData";

export default function EmailSupport() {
  const { brand } = useBrandData();
  const { createSupportRequest, loading, error } = useSupportRequests();
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleSubmit = async (formData: {
    subject: string;
    description: string;
    priority: string;
    attachments: File[];
  }) => {
    if (!brand) {
      setSubmissionError(
        "Brand profile not found. Please complete your profile first."
      );
      return;
    }

    setSubmissionError(null);

    try {
      // Prepare support request data
      const supportRequestData = {
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority as "low" | "medium" | "high",
        has_attachment: formData.attachments.length > 0,
        attachment_url: undefined as string | undefined,
        attachment_urls: [] as string[],
      };

      // If there are attachments, handle file uploads
      if (formData.attachments.length > 0) {
        // In a real implementation, you would upload the files to Supabase Storage
        // and update the support_request record with the attachment_urls
        console.log(
          "Would upload files:",
          formData.attachments.map((f) => f.name)
        );

        // For now, we'll just simulate the URLs
        supportRequestData.attachment_urls = formData.attachments.map(
          (file) => `https://storage.example.com/attachments/${file.name}`
        );

        // Keep the single attachment_url for backward compatibility
        supportRequestData.attachment_url =
          supportRequestData.attachment_urls[0];
      }

      // Create the support request
      await createSupportRequest(supportRequestData);

      // Show success state
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting support request:", err);
      setSubmissionError(
        err instanceof Error
          ? err.message
          : "Failed to submit support request. Please try again."
      );
    }
  };

  return (
    <div className="container-responsive py-4 sm:py-6">
      <Header
        title="Contact Support"
        subtitle="Get help from the Stylsia support team"
      />

      <div className="mt-6 space-y-6">
        {/* Support Info Card */}
        <SupportInfoCard email="support@stylsia.com" responseTime="24 hours" />

        {/* Error message */}
        {(error || submissionError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error || submissionError}</p>
          </div>
        )}

        {/* Support Request Form */}
        {!submitted ? (
          <EmailSupportForm onSubmit={handleSubmit} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Support Request Submitted
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Thank you for contacting us. We've received your request and will
              respond to you via email within 24 hours.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-sm text-gray-700">
                A confirmation email has been sent to{" "}
                {brand?.contact_email || "your registered email address"}.
                Please check your inbox.
              </p>
            </div>
            <Button onClick={() => setSubmitted(false)}>
              Submit Another Request
            </Button>
          </div>
        )}

        {/* Support FAQ */}
        <SupportFAQ />
      </div>
    </div>
  );
}
