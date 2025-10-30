"use client";

import { useState, useEffect } from "react";

export default function EmailJourneyPage() {
  const [loading, setLoading] = useState(true);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  // Email Templates for manual sending
  const emailTemplates = [
    {
      id: "welcome-signup",
      title: "Welcome Email",
      description: "Welcome new customers (joined within 24 hours)",
      icon: "👋",
      category: "Onboarding",
      defaultSubject: "Welcome to Sabri Jewelry! ✨",
      defaultMessage: `Dear [Customer Name],

Welcome to Sabri Jewelry! We're thrilled to have you join our family of jewelry lovers.

At Sabri, we craft exquisite jewelry pieces that celebrate life's special moments. Whether you're looking for rings, necklaces, earrings, or bracelets, we have something special for you.

Explore our latest collections and discover your next favorite piece!

Best regards,
Sabri Jewelry Team`,
      color: "#008060",
    },
    {
      id: "abandoned-cart",
      title: "Abandoned Cart Reminder",
      description: "All users who have items in their cart",
      icon: "🛒",
      category: "Marketing",
      defaultSubject: "You left something behind! 💎",
      defaultMessage: `Hi [Customer Name],

We noticed you left some beautiful items in your cart. Don't miss out on these stunning pieces!

Your cart includes:
[Cart Items]

Complete your purchase now and make these treasures yours!

Best regards,
Sabri Jewelry`,
      color: "#2C6ECB",
    },
    {
      id: "order-confirmation",
      title: "Order Confirmation",
      description: "Confirm customer orders with details",
      icon: "📦",
      category: "Transactional",
      defaultSubject: "Order Confirmed - Order #[Order Number]",
      defaultMessage: `Dear [Customer Name],

Thank you for your order! We're excited to prepare your jewelry for delivery.

Order Details:
Order Number: [Order Number]
Order Date: [Order Date]
Total Amount: ₹[Total Amount]

Items:
[Order Items]

We'll notify you once your order is shipped.

Best regards,
Sabri Jewelry Team`,
      color: "#008060",
    },
    {
      id: "order-shipped",
      title: "Order Shipped",
      description: "Notify customers when order is shipped",
      icon: "🚚",
      category: "Transactional",
      defaultSubject: "Your Order Has Been Shipped! 📦",
      defaultMessage: `Dear [Customer Name],

Great news! Your order #[Order Number] has been shipped and is on its way to you.

Tracking Details:
Tracking Number: [Tracking Number]
Expected Delivery: [Delivery Date]

Track your order: [Tracking Link]

We hope you love your new jewelry!

Best regards,
Sabri Jewelry Team`,
      color: "#B98900",
    },
    {
      id: "order-delivered",
      title: "Order Delivered",
      description: "Confirm delivery and request feedback",
      icon: "🎉",
      category: "Post-Purchase",
      defaultSubject: "Your Order Has Been Delivered! 💝",
      defaultMessage: `Dear [Customer Name],

Your order #[Order Number] has been successfully delivered!

We hope you love your new jewelry. If you have a moment, we'd love to hear your feedback.

Leave a review: [Review Link]

Thank you for choosing Sabri Jewelry!

Best regards,
Sabri Jewelry Team`,
      color: "#008060",
    },
    {
      id: "order-cancelled",
      title: "Order Cancellation",
      description: "Notify customers about order cancellation",
      icon: "❌",
      category: "Transactional",
      defaultSubject: "Order Cancellation - Order #[Order Number]",
      defaultMessage: `Dear [Customer Name],

We're writing to inform you that your order #[Order Number] has been cancelled.

Cancellation Details:
Order Number: [Order Number]
Refund Amount: ₹[Refund Amount]
Refund Status: Processing (3-5 business days)

If you have any questions, please don't hesitate to contact us.

Best regards,
Sabri Jewelry Team`,
      color: "#D72C0D",
    },
    {
      id: "product-review",
      title: "Review Request",
      description: "Request product reviews from customers",
      icon: "⭐",
      category: "Post-Purchase",
      defaultSubject: "How's your new jewelry? We'd love your feedback! ⭐",
      defaultMessage: `Dear [Customer Name],

We hope you're enjoying your recent purchase from Sabri Jewelry!

Your feedback helps us serve you better and helps other customers make informed decisions.

Share your experience: [Review Link]

As a thank you, enjoy 10% off your next purchase!

Best regards,
Sabri Jewelry Team`,
      color: "#B98900",
    },
    {
      id: "new-product",
      title: "New Product Announcement",
      description: "Announce new jewelry collections",
      icon: "🆕",
      category: "Marketing",
      defaultSubject: "New Arrivals Alert! ✨ Fresh Designs Just Added",
      defaultMessage: `Dear [Customer Name],

Exciting news! We've just added stunning new pieces to our collection.

Check out our latest arrivals:
[Product Links]

Shop now and be among the first to own these exclusive designs!

Best regards,
Sabri Jewelry Team`,
      color: "#2C6ECB",
    },
    {
      id: "wishlist-reminder",
      title: "Wishlist Reminder",
      description: "All users who have items in their wishlist",
      icon: "💖",
      category: "Marketing",
      defaultSubject: "Your Wishlist Items Are Waiting! 💖",
      defaultMessage: `Dear [Customer Name],

Don't let your favorite pieces slip away!

You have [Number] items in your wishlist:
[Wishlist Items]

Shop now before they're gone!

Best regards,
Sabri Jewelry Team`,
      color: "#D72C0D",
    },
    {
      id: "special-offer",
      title: "Special Offer",
      description: "Send promotional offers to customers",
      icon: "🎁",
      category: "Marketing",
      defaultSubject: "Exclusive Offer Just for You! 🎁",
      defaultMessage: `Dear [Customer Name],

We have a special offer just for you!

[Offer Details]

Use code: [Coupon Code]
Valid until: [Expiry Date]

Don't miss out on this exclusive deal!

Best regards,
Sabri Jewelry Team`,
      color: "#008060",
    },
    {
      id: "thank-you",
      title: "Thank You Email",
      description: "Thank customers for their purchase",
      icon: "💝",
      category: "Post-Purchase",
      defaultSubject: "Thank You for Your Purchase! 💝",
      defaultMessage: `Dear [Customer Name],

Thank you for choosing Sabri Jewelry for your special purchase!

We're honored to be part of your journey and hope our jewelry brings you joy.

Looking forward to serving you again soon!

Best regards,
Sabri Jewelry Team`,
      color: "#D72C0D",
    },
    {
      id: "back-in-stock",
      title: "Back in Stock Alert",
      description: "Notify when out-of-stock items are available",
      icon: "🔔",
      category: "Marketing",
      defaultSubject: "Good News! Your Favorite Item is Back! 🔔",
      defaultMessage: `Dear [Customer Name],

The item you were interested in is back in stock!

[Product Details]

Order now before it sells out again!

Best regards,
Sabri Jewelry Team`,
      color: "#008060",
    },
  ];

  const categories = [
    "All",
    "Onboarding",
    "Marketing",
    "Transactional",
    "Post-Purchase",
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    loadUsers();
    setLoading(false);
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/customers?limit=1000");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.customers) {
          setUsers(data.data.customers);
        }
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setShowUsersModal(true);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setEmailForm({
      subject: selectedTemplate.defaultSubject.replace(
        "[Customer Name]",
        user.email
      ),
      message: selectedTemplate.defaultMessage.replace(
        "[Customer Name]",
        user.email
      ),
    });
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.message || !selectedUser) {
      alert("Please fill in all fields");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedUser.email,
          subject: emailForm.subject,
          message: emailForm.message,
          userName: selectedUser.name || selectedUser.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Email sent successfully!");
        setShowEmailModal(false);
        setShowUsersModal(false);
        resetForm();
      } else {
        alert(data.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error sending email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setEmailForm({
      subject: "",
      message: "",
    });
    setSelectedUser(null);
    setSelectedTemplate(null);
    setSearchQuery("");
  };

  const filteredTemplates =
    selectedCategory === "All"
      ? emailTemplates
      : emailTemplates.filter((t) => t.category === selectedCategory);

  // Filter users based on template type
  const getFilteredUsersByTemplate = () => {
    if (!selectedTemplate) return users;

    const now = new Date();
    let filtered = [...users];

    switch (selectedTemplate.id) {
      case "welcome-signup":
        // Only users who joined in the last 24 hours
        filtered = users.filter((user) => {
          if (!user.createdAt) return false;
          const userCreatedAt = new Date(user.createdAt);
          const timeDiff = now - userCreatedAt;
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          return hoursDiff <= 24;
        });
        console.log(
          "Welcome email filter - Users in last 24h:",
          filtered.length
        );
        break;

      case "abandoned-cart":
        // All users who have items in their cart
        filtered = users.filter((user) => {
          // Check if user has cart data
          if (!user.cartData || typeof user.cartData !== "object") return false;

          // Check if cart has items (cartData is an object with product IDs as keys)
          const cartItems = Object.keys(user.cartData);
          return cartItems.length > 0;
        });
        console.log(
          "Abandoned cart filter - Users with items in cart:",
          filtered.length
        );
        break;

      case "wishlist-reminder":
        // All users who have items in their wishlist
        filtered = users.filter((user) => {
          // Check if user has wishlist data
          if (!user.wishlistData || typeof user.wishlistData !== "object")
            return false;

          // Check if wishlist has items (wishlistData is an object with product IDs as keys)
          const wishlistItems = Object.keys(user.wishlistData);
          return wishlistItems.length > 0;
        });
        console.log(
          "Wishlist reminder filter - Users with items in wishlist:",
          filtered.length
        );
        break;

      // Add more filters for other templates as needed
      default:
        filtered = users;
    }

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter((user) =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredUsers = showUsersModal ? getFilteredUsersByTemplate() : users;

  const stats = {
    totalTemplates: emailTemplates.length,
    totalUsers: users.length,
    emailsSent: 0,
    pendingEmails: 0,
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
            style={{
              border: "3px solid var(--shopify-border)",
              borderTopColor: "var(--shopify-action-primary)",
            }}
          ></div>
          <p
            className="font-medium"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Loading email templates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: "var(--shopify-bg-primary)" }}
            >
              📧
            </div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              Email Journey
            </h1>
          </div>
          <p
            className="text-sm"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Select a template, choose a user, and send personalized emails
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="rounded-lg p-5 border"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Email Templates
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            {stats.totalTemplates}
          </p>
        </div>

        <div
          className="rounded-lg p-5 border"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Total Users
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-action-primary)" }}
          >
            {stats.totalUsers}
          </p>
        </div>

        <div
          className="rounded-lg p-5 border"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Emails Sent
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-primary)" }}
          >
            {stats.emailsSent}
          </p>
        </div>

        <div
          className="rounded-lg p-5 border"
          style={{
            backgroundColor: "var(--shopify-surface)",
            borderColor: "var(--shopify-border)",
          }}
        >
          <p
            className="text-sm mb-1"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            Pending
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: "var(--shopify-text-secondary)" }}
          >
            {stats.pendingEmails}
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
            style={
              selectedCategory === category
                ? {
                    backgroundColor: "var(--shopify-action-primary)",
                    borderColor: "var(--shopify-action-primary)",
                    color: "white",
                  }
                : {
                    backgroundColor: "var(--shopify-surface)",
                    borderColor: "var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }
            }
            onMouseEnter={(e) =>
              selectedCategory !== category &&
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-surface-hover)")
            }
            onMouseLeave={(e) =>
              selectedCategory !== category &&
              (e.currentTarget.style.backgroundColor = "var(--shopify-surface)")
            }
          >
            {category}
          </button>
        ))}
      </div>

      {/* Email Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-lg border p-6 transition-all hover:shadow-md"
            style={{
              backgroundColor: "var(--shopify-surface)",
              borderColor: "var(--shopify-border)",
            }}
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  backgroundColor: `${template.color}15`,
                }}
              >
                {template.icon}
              </div>
              <div className="flex-1">
                <h3
                  className="font-semibold text-base mb-1"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  {template.title}
                </h3>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  {template.category}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  {template.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSelectTemplate(template)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-white"
                style={{
                  backgroundColor: template.color,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                📤 Send to Users
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Users List Modal */}
      {showUsersModal && selectedTemplate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowUsersModal(false);
            setSearchQuery("");
          }}
        >
          <div
            className="rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            style={{
              backgroundColor: "var(--shopify-surface)",
              border: "1px solid var(--shopify-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="p-6 border-b"
              style={{ borderColor: "var(--shopify-border)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: `${selectedTemplate.color}15`,
                    }}
                  >
                    {selectedTemplate.icon}
                  </div>
                  <div>
                    <h2
                      className="text-xl font-semibold"
                      style={{ color: "var(--shopify-text-primary)" }}
                    >
                      {selectedTemplate.title}
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: "var(--shopify-text-secondary)" }}
                    >
                      Select a user to send email
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUsersModal(false);
                    setSearchQuery("");
                  }}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: "var(--shopify-text-secondary)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    borderColor: "var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                />
                <svg
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                    style={{ backgroundColor: "var(--shopify-bg-primary)" }}
                  >
                    👥
                  </div>
                  <p
                    className="font-medium mb-1"
                    style={{ color: "var(--shopify-text-primary)" }}
                  >
                    No users found
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--shopify-text-secondary)" }}
                  >
                    {searchQuery
                      ? "Try a different search term"
                      : "No registered users yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full p-4 rounded-lg border text-left transition-all hover:shadow-md"
                      style={{
                        backgroundColor: "var(--shopify-surface)",
                        borderColor: "var(--shopify-border)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor =
                          selectedTemplate.color)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--shopify-border)")
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                            style={{
                              backgroundColor: selectedTemplate.color,
                            }}
                          >
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p
                              className="font-medium"
                              style={{ color: "var(--shopify-text-primary)" }}
                            >
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: "var(--shopify-text-secondary)" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="p-4 border-t flex justify-between items-center"
              style={{ borderColor: "var(--shopify-border)" }}
            >
              <p
                className="text-sm"
                style={{ color: "var(--shopify-text-secondary)" }}
              >
                Total: {filteredUsers.length} user
                {filteredUsers.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => {
                  setShowUsersModal(false);
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  borderColor: "var(--shopify-border)",
                  color: "var(--shopify-text-primary)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface)")
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Compose Modal */}
      {showEmailModal && selectedUser && selectedTemplate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !sending && setShowEmailModal(false)}
        >
          <div
            className="rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--shopify-surface)",
              border: "1px solid var(--shopify-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="p-6 border-b"
              style={{ borderColor: "var(--shopify-border)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: `${selectedTemplate.color}15`,
                    }}
                  >
                    {selectedTemplate.icon}
                  </div>
                  <div>
                    <h2
                      className="text-xl font-semibold"
                      style={{ color: "var(--shopify-text-primary)" }}
                    >
                      Send {selectedTemplate.title}
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: "var(--shopify-text-secondary)" }}
                    >
                      To: {selectedUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !sending && setShowEmailModal(false)}
                  disabled={sending}
                  className="p-2 rounded-lg transition-colors disabled:opacity-50"
                  style={{
                    color: "var(--shopify-text-secondary)",
                  }}
                  onMouseEnter={(e) =>
                    !sending &&
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Subject */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Subject Line
                </label>
                <input
                  type="text"
                  placeholder="Enter email subject"
                  value={emailForm.subject}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, subject: e.target.value })
                  }
                  disabled={sending}
                  className="w-full px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    borderColor: "var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                />
              </div>

              {/* Message */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Email Message
                </label>
                <textarea
                  rows={14}
                  placeholder="Enter your email message here..."
                  value={emailForm.message}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, message: e.target.value })
                  }
                  disabled={sending}
                  className="w-full px-3 py-2 rounded-lg border text-sm disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    borderColor: "var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                />
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  Customize the message before sending
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="p-6 border-t flex justify-end gap-3"
              style={{ borderColor: "var(--shopify-border)" }}
            >
              <button
                onClick={() => setShowEmailModal(false)}
                disabled={sending}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border disabled:opacity-50"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  borderColor: "var(--shopify-border)",
                  color: "var(--shopify-text-primary)",
                }}
                onMouseEnter={(e) =>
                  !sending &&
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--shopify-surface)")
                }
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={!emailForm.subject || !emailForm.message || sending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{
                  backgroundColor: selectedTemplate.color,
                }}
                onMouseEnter={(e) =>
                  !e.currentTarget.disabled &&
                  (e.currentTarget.style.opacity = "0.9")
                }
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
