import { useState, useEffect } from "react";
import {
  Mail,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Paperclip,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { supabase } from "../../lib/supabase";
import AuditLogViewer from "../../components/common/AuditLogViewer";

interface SupportRequest {
  id: string;
  brand_id: string;
  email?: string;
  brand?: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "new" | "in_progress" | "resolved" | "closed";
  has_attachment: boolean;
  attachment_url?: string;
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export default function AdminSupport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(
    null
  );
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Fetch support requests from database
  useEffect(() => {
    const fetchSupportRequests = async () => {
      setLoading(true);
      try {
        // Try the admin function first
        const { data, error } = await supabase.rpc(
          "admin_get_all_support_requests"
        );

        if (error) {
          console.error("Admin RPC call failed, trying fallback...", error);

          // Fallback to the original RPC function
          const { data: fallbackData, error: fallbackError } =
            await supabase.rpc("get_support_requests_with_brand_info");

          if (fallbackError) {
            console.error(
              "Fallback RPC failed, trying direct query...",
              fallbackError
            );

            // Final fallback to direct query
            const { data: directData, error: directError } = await supabase
              .from("support_requests")
              .select(
                `
                *,
                brand:brands(id, name, contact_email)
              `
              )
              .order("created_at", { ascending: false });

            if (directError) throw directError;

            // Transform direct query data
            const transformedData = (directData || []).map((request) => ({
              ...request,
              email: request.brand?.contact_email || "unknown@example.com",
              brand: request.brand?.name || "Unknown Brand",
              attachment_urls: request.attachment_urls
                ? Array.isArray(request.attachment_urls)
                  ? request.attachment_urls
                  : []
                : request.attachment_url
                ? [request.attachment_url]
                : [],
            }));

            setSupportRequests(transformedData);
          } else {
            // Transform fallback RPC data
            const transformedData = (fallbackData || []).map(
              (request: any) => ({
                id: request.request_id,
                brand_id: request.brand_id,
                subject: request.subject,
                description: request.description,
                priority: request.priority,
                status: request.status,
                has_attachment: request.has_attachment,
                attachment_url: request.attachment_url,
                attachment_urls: request.attachment_urls
                  ? Array.isArray(request.attachment_urls)
                    ? request.attachment_urls
                    : []
                  : request.attachment_url
                  ? [request.attachment_url]
                  : [],
                created_at: request.created_at,
                updated_at: request.created_at,
                email: request.brand_email || "unknown@example.com",
                brand: request.brand_name || "Unknown Brand",
              })
            );

            setSupportRequests(transformedData);
          }
        } else {
          // Transform admin RPC data - this should be the primary path
          const transformedData = (data || []).map((request: any) => ({
            id: request.id,
            brand_id: request.brand_id,
            subject: request.subject,
            description: request.description,
            priority: request.priority,
            status: request.status,
            has_attachment: request.has_attachment,
            attachment_url: request.attachment_url,
            attachment_urls: request.attachment_urls
              ? Array.isArray(request.attachment_urls)
                ? request.attachment_urls
                : []
              : request.attachment_url
              ? [request.attachment_url]
              : [],
            created_at: request.created_at,
            updated_at: request.updated_at || request.created_at,
            resolved_at: request.resolved_at,
            email: request.brand_email || "unknown@example.com",
            brand: request.brand_name || "Unknown Brand",
          }));

          setSupportRequests(transformedData);
        }
      } catch (err) {
        console.error("Error fetching support requests:", err);
        setError(
          "Failed to load support requests. Please check your admin permissions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSupportRequests();
  }, []);

  // Filter support requests based on search term and filters
  const filteredRequests = supportRequests.filter((request) => {
    const matchesSearch =
      request.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.brand || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "closed":
        return <CheckCircle className="h-4 w-4 text-slate-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-amber-100 text-amber-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-slate-100 text-slate-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAttachmentCount = (request: SupportRequest) => {
    if (!request.has_attachment) return 0;
    if (request.attachment_urls && request.attachment_urls.length > 0) {
      return request.attachment_urls.length;
    }
    if (request.attachment_url) return 1;
    return 0;
  };

  const getAttachmentText = (request: SupportRequest) => {
    const count = getAttachmentCount(request);
    if (count === 0) return "";
    if (count === 1) return "Attachment";
    return `${count} Attachments`;
  };

  const handleReplyToEmail = (requestId: string) => {
    // In a real implementation, this would open an email client or a compose modal
    // For now, we'll just open the default email client with a pre-filled subject
    if (selectedRequest) {
      window.open(
        `mailto:${selectedRequest.email}?subject=Re: ${selectedRequest.subject}&body=Hello,\n\nThank you for contacting Stylsia support regarding: ${selectedRequest.subject}\n\nWe have received your request (ID: ${requestId}) and will assist you with this matter.\n\nBest regards,\nStylsia Support Team`,
        "_blank"
      );
    }
  };

  const handleUpdateStatus = async (
    requestId: string,
    newStatus: SupportRequest["status"]
  ) => {
    try {
      // Try using the admin function first
      const { data: success, error: rpcError } = await supabase.rpc(
        "admin_update_support_request_status",
        {
          request_id: requestId,
          new_status: newStatus,
          admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        }
      );

      if (rpcError || !success) {
        console.warn(
          "Admin RPC update failed, trying direct update...",
          rpcError
        );

        // Fallback to direct update
        const { error: directError } = await supabase
          .from("support_requests")
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
            ...(newStatus === "resolved"
              ? { resolved_at: new Date().toISOString() }
              : {}),
          })
          .eq("id", requestId);

        if (directError) throw directError;
      }

      // Record audit log (optional, may fail due to permissions)
      try {
        await supabase.rpc("record_audit_event", {
          user_uuid: (await supabase.auth.getUser()).data.user?.id,
          action_name: "UPDATE",
          table_name: "support_requests",
          record_id: requestId,
          details_json: {
            status: { old: selectedRequest?.status, new: newStatus },
          },
        });
      } catch (auditError) {
        console.warn("Failed to record audit event:", auditError);
        // Continue anyway as audit logging is not critical
      }

      // Update local state
      setSupportRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: newStatus,
                updated_at: new Date().toISOString(),
                ...(newStatus === "resolved"
                  ? { resolved_at: new Date().toISOString() }
                  : {}),
              }
            : req
        )
      );

      // Close detail view
      setSelectedRequest(null);
    } catch (err) {
      console.error("Error updating support request status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Support Requests
          </h1>
          <p className="text-slate-600 mt-1">Loading support requests...</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading support requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Support Requests
          </h1>
          <p className="text-slate-600 mt-1">Error loading support requests</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Failed to Load Support Requests
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Support Requests
        </h1>
        <p className="text-slate-600 mt-1">
          Manage and respond to brand partner support requests
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">New</p>
              <p className="text-xl font-bold text-slate-900">
                {supportRequests.filter((r) => r.status === "new").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">In Progress</p>
              <p className="text-xl font-bold text-slate-900">
                {
                  supportRequests.filter((r) => r.status === "in_progress")
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">Resolved</p>
              <p className="text-xl font-bold text-slate-900">
                {supportRequests.filter((r) => r.status === "resolved").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600">
                High Priority
              </p>
              <p className="text-xl font-bold text-slate-900">
                {supportRequests.filter((r) => r.priority === "high").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by brand, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Support Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No support requests found
            </h3>
            <p className="text-slate-600">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Support requests will appear here when brands submit them."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              <div className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {request.subject}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {request.brand || "Unknown Brand"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {request.email || "unknown@example.com"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status.replace("_", " ")}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                            request.priority
                          )}`}
                        >
                          {request.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">
                        {formatDate(request.created_at)}
                      </span>
                      {request.has_attachment && (
                        <Paperclip className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {request.brand || "Unknown Brand"}
                            </div>
                            <div className="text-sm text-slate-500">
                              {request.email || "unknown@example.com"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 max-w-xs truncate">
                          {request.subject}
                        </div>
                        <div className="flex items-center mt-1">
                          {request.has_attachment && (
                            <div className="flex items-center text-xs text-slate-500">
                              <Paperclip className="h-3 w-3 mr-1" />
                              <span>{getAttachmentText(request)}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(request.status)}
                          <span
                            className={`ml-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {request.status.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            request.priority
                          )}`}
                        >
                          {request.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Support Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity"
              onClick={() => setSelectedRequest(null)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg leading-6 font-medium text-slate-900">
                        Support Request Details
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            selectedRequest.status
                          )}`}
                        >
                          {selectedRequest.status.replace("_", " ")}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            selectedRequest.priority
                          )}`}
                        >
                          {selectedRequest.priority}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <div className="mb-4">
                        <p className="text-sm font-medium text-slate-500">
                          From
                        </p>
                        <div className="mt-1">
                          <p className="text-sm text-slate-900">
                            {selectedRequest.brand || "Unknown Brand"}
                          </p>
                          <p className="text-sm text-slate-600">
                            {selectedRequest.email || "unknown@example.com"}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-slate-500">
                          Subject
                        </p>
                        <p className="mt-1 text-sm text-slate-900">
                          {selectedRequest.subject}
                        </p>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-slate-500">
                          Description
                        </p>
                        <div className="mt-1 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-900 whitespace-pre-wrap">
                            {selectedRequest.description}
                          </p>
                        </div>
                      </div>

                      {selectedRequest.has_attachment &&
                        ((selectedRequest.attachment_urls &&
                          selectedRequest.attachment_urls.length > 0) ||
                          selectedRequest.attachment_url) && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-slate-500">
                              {getAttachmentText(selectedRequest)}
                            </p>
                            <div className="mt-1 space-y-2">
                              {selectedRequest.attachment_urls?.map(
                                (url, index) => {
                                  const fileName =
                                    url.split("/").pop() ||
                                    `attachment_${index + 1}`;
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-2 p-2 border border-slate-200 rounded-lg"
                                    >
                                      <Paperclip className="h-4 w-4 text-slate-400" />
                                      <span className="text-sm text-slate-900 flex-1">
                                        {fileName}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        icon={Download}
                                        className="ml-auto"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Open the file in a new tab
                                          window.open(url, "_blank");
                                        }}
                                      >
                                        Download
                                      </Button>
                                    </div>
                                  );
                                }
                              ) ||
                                // Fallback for single attachment_url
                                (selectedRequest.attachment_url && (
                                  <div className="flex items-center space-x-2 p-2 border border-slate-200 rounded-lg">
                                    <Paperclip className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-900">
                                      {selectedRequest.attachment_url
                                        .split("/")
                                        .pop() || "attachment"}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      icon={Download}
                                      className="ml-auto"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                          selectedRequest.attachment_url,
                                          "_blank"
                                        );
                                      }}
                                    >
                                      Download
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      <div className="mb-4">
                        <p className="text-sm font-medium text-slate-500">
                          Timestamps
                        </p>
                        <div className="mt-1 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-500">Created</p>
                            <p className="text-sm text-slate-900">
                              {formatDate(selectedRequest.created_at)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              Last Updated
                            </p>
                            <p className="text-sm text-slate-900">
                              {formatDate(selectedRequest.updated_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Audit Log Button */}
                      <div className="mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAuditLog(true)}
                        >
                          View Audit Log
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={() => handleReplyToEmail(selectedRequest.id)}
                  icon={Mail}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Reply via Email
                </Button>

                <div className="mt-3 sm:mt-0 sm:mr-3">
                  <select
                    value={selectedRequest.status}
                    onChange={(e) =>
                      handleUpdateStatus(
                        selectedRequest.id,
                        e.target.value as SupportRequest["status"]
                      )
                    }
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setSelectedRequest(null)}
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditLog && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowAuditLog(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <AuditLogViewer
                tableName="support_requests"
                recordId={selectedRequest.id}
                title={`Audit Log: ${selectedRequest.subject}`}
                onClose={() => setShowAuditLog(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
