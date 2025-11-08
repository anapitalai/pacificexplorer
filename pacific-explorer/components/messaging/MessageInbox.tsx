"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Message {
  id: number;
  content: string;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    username: string;
  };
  receiver: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    username: string;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  username: string;
}

interface MessageInboxProps {
  className?: string;
}

export default function MessageInbox({ className = "" }: MessageInboxProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    receiverId: "",
    content: "",
  });
  const [availableRecipients, setAvailableRecipients] = useState<User[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchMessages();
    }
  }, [session]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/messages?type=all&limit=20");
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipients = async () => {
    try {
      setLoadingRecipients(true);
      // Fetch destination owners and other business owners that tourists can message
      const response = await fetch("/api/users/recipients");
      if (!response.ok) {
        throw new Error("Failed to fetch recipients");
      }
      const data = await response.json();
      setAvailableRecipients(data.recipients || []);
    } catch (err) {
      console.error("Failed to fetch recipients:", err);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleComposeClick = () => {
    setShowCompose(true);
    if (availableRecipients.length === 0) {
      fetchRecipients();
    }
  };

  const markAsRead = async (messageIds: number[]) => {
    try {
      const response = await fetch("/api/messages/read", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageIds }),
      });

      if (response.ok) {
        // Update local state
        setMessages(prev =>
          prev.map(msg =>
            messageIds.includes(msg.id)
              ? { ...msg, isRead: true, readAt: new Date() }
              : msg
          )
        );
        setUnreadCount(prev => Math.max(0, prev - messageIds.length));
      }
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  const sendMessage = async () => {
    if (!composeData.receiverId || !composeData.content.trim()) {
      return;
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(composeData),
      });

      if (response.ok) {
        setComposeData({ receiverId: "", content: "" });
        setShowCompose(false);
        fetchMessages(); // Refresh messages
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send message");
      }
    } catch {
      alert("Failed to send message");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleColor = (role: string) => {
    const colors = {
      TOURIST: "bg-blue-100 text-blue-800",
      HOTEL_OWNER: "bg-green-100 text-green-800",
      HIRE_CAR_OWNER: "bg-orange-100 text-orange-800",
      DESTINATION_OWNER: "bg-purple-100 text-purple-800",
      ADMIN: "bg-red-100 text-red-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading messages...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Error loading messages</div>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={fetchMessages}
            className="mt-4 px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            {unreadCount > 0 && (
              <span className="text-sm text-gray-600">
                {unreadCount} unread
              </span>
            )}
          </div>
          <button
            onClick={handleComposeClick}
            className="px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Compose</span>
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No messages yet
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                !message.isRead ? "bg-blue-50" : ""
              }`}
              onClick={() => {
                setSelectedMessage(message);
                if (!message.isRead) {
                  markAsRead([message.id]);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {message.sender.name || message.sender.username || message.sender.email}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(message.sender.role)}`}>
                      {message.sender.role.replace("_", " ")}
                    </span>
                    {!message.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {message.content}
                  </p>
                </div>
                <span className="text-xs text-gray-500 ml-4">
                  {formatDate(message.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Compose Message</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Send to
                  </label>
                  {loadingRecipients ? (
                    <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg">
                      <div className="w-4 h-4 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Loading recipients...</span>
                    </div>
                  ) : (
                    <select
                      value={composeData.receiverId}
                      onChange={(e) => setComposeData(prev => ({ ...prev, receiverId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                    >
                      <option value="">Select a recipient...</option>
                      {availableRecipients.map((recipient) => (
                        <option key={recipient.id} value={recipient.id}>
                          {recipient.name || recipient.username} ({recipient.role.replace("_", " ")})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={composeData.content}
                    onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Type your message..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCompose(false);
                    setComposeData({ receiverId: "", content: "" });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!composeData.receiverId || !composeData.content.trim()}
                  className="flex-1 px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Message Details</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">From:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-medium">
                      {selectedMessage.sender.name || selectedMessage.sender.username || selectedMessage.sender.email}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedMessage.sender.role)}`}>
                      {selectedMessage.sender.role.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Date:</span>
                  <span className="ml-2">{formatDate(selectedMessage.createdAt)}</span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Message:</span>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    {selectedMessage.content}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setComposeData({
                      receiverId: selectedMessage.sender.id,
                      content: "",
                    });
                    setSelectedMessage(null);
                    setShowCompose(true);
                    if (availableRecipients.length === 0) {
                      fetchRecipients();
                    }
                  }}
                  className="px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600"
                >
                  Reply
                </button>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
