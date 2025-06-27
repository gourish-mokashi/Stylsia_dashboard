import React, { useState } from 'react';
import { Mail, Paperclip, Send, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';

interface EmailSupportFormProps {
  onSubmit?: (formData: {
    subject: string;
    description: string;
    priority: string;
    attachment: File | null;
  }) => Promise<void>;
}

export default function EmailSupportForm({ onSubmit }: EmailSupportFormProps) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    attachment: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    // Check file size (10MB limit)
    if (file && file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }
    
    setFormData({
      ...formData,
      attachment: file
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default implementation if no onSubmit provided
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Support request submitted:', formData);
      }
      
      // Show success state
      setSubmitted(true);
      
      // Reset form
      setFormData({
        subject: '',
        description: '',
        priority: 'medium',
        attachment: null
      });
    } catch (err) {
      setError('Failed to submit support request. Please try again.');
      console.error('Error submitting support request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Support Request Submitted</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Thank you for contacting us. We've received your request and will respond to you via email within 24 hours.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
          <p className="text-sm text-gray-700">
            A confirmation email has been sent to your registered email address. Please check your inbox.
          </p>
        </div>
        <Button onClick={handleReset}>Submit Another Request</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Submit a Support Request</h2>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Brief description of your issue"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Please provide details about your issue or question"
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="low">Low - General question</option>
            <option value="medium">Medium - Issue affecting some functionality</option>
            <option value="high">High - Critical issue affecting business</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-2">
            Attachment (Optional)
          </label>
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Paperclip className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                {formData.attachment ? formData.attachment.name : 'Choose file'}
              </span>
              <input
                type="file"
                id="attachment"
                name="attachment"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {formData.attachment && (
              <button
                type="button"
                onClick={() => setFormData({...formData, attachment: null})}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Max file size: 10MB. Supported formats: PDF, JPG, PNG, DOC, DOCX
          </p>
        </div>
        
        <div className="pt-4">
          <Button
            type="submit"
            icon={Send}
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? 'Submitting...' : 'Submit Support Request'}
          </Button>
        </div>
      </form>
    </div>
  );
}