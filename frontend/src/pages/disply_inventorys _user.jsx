import React, { useState, useEffect } from "react";
import axios from "axios";

const COLORS = {
  pageBg: "#F2F2F2",
  cardBg: "#FFFFFF",
  cardSoft: "#EEF4FF",
  line: "#E6E6E6",
  text: "#1F2937",
  textMuted: "#6B7280",
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
};

const modalAnimationStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes popIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .modal-fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .modal-pop-in {
    animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

const DisplayInventorysUser = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    quantity: 1,
    purpose: "",
    startDate: "",
    startTime: "",
    endTime: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [userBookingsLoading, setUserBookingsLoading] = useState(false);

  useEffect(() => {
    fetchInventories();
  }, []);

  const fetchInventories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/api/inventory");
      setInventories(response.data.data || []);
    } catch (err) {
      console.error("Error fetching inventories:", err);
      setError("Failed to load inventory. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (field, value) => {
    setBookingFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openBookingForm = () => {
    setShowBookingForm(true);
  };

  const closeBookingForm = () => {
    setShowBookingForm(false);
    setBookingFormData({
      quantity: 1,
      purpose: "",
      startDate: "",
      startTime: "",
      endTime: "",
    });
  };

  const handleSubmitBooking = async () => {
    try {
      if (!bookingFormData.quantity || !bookingFormData.purpose || !bookingFormData.startDate || !bookingFormData.startTime || !bookingFormData.endTime) {
        alert("Please fill all fields");
        return;
      }

      if (bookingFormData.quantity > selectedItem.quantity) {
        alert(`Only ${selectedItem.quantity} units available`);
        return;
      }

      // Combine date and time for start
      const startDateTime = `${bookingFormData.startDate}T${bookingFormData.startTime}`;
      const startDate = new Date(startDateTime);

      // End date is same day as start date, but with different time
      const endDateTime = `${bookingFormData.startDate}T${bookingFormData.endTime}`;
      const endDate = new Date(endDateTime);

      if (endDate <= startDate) {
        alert("End time must be after start time");
        return;
      }

      setBookingLoading(true);

      const userId = localStorage.getItem("userId") || "user123";

      const bookingData = {
        inventoryId: selectedItem._id,
        userId: userId,
        quantity: parseInt(bookingFormData.quantity),
        purpose: bookingFormData.purpose,
        requestedStartDate: startDateTime,
        requestedEndDate: endDateTime,
      };

      const response = await axios.post(
        "http://localhost:5000/api/bookings/book",
        bookingData
      );

      alert("Booking request submitted successfully! Admin will review it soon.");
      closeBookingForm();
      setSelectedItem(null);
    } catch (err) {
      console.error("Error submitting booking:", err);
      alert(err.response?.data?.message || "Failed to submit booking request");
    } finally {
      setBookingLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      setUserBookingsLoading(true);
      const userId = localStorage.getItem("userId") || "user123";
      const res = await axios.get(`http://localhost:5000/api/bookings/user/${userId}`);
      setUserBookings(res.data.data || []);
      setShowMyBookings(true);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      alert("Failed to load your bookings");
    } finally {
      setUserBookingsLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: { bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-800", icon: "⏳" },
      approved: { bg: "bg-green-100", border: "border-green-300", text: "text-green-800", icon: "✅" },
      declined: { bg: "bg-red-100", border: "border-red-300", text: "text-red-800", icon: "❌" },
      completed: { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800", icon: "🎉" },
      cancelled: { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-700", icon: "🚫" },
    };
    return colors[status] || colors.pending;
  };

  // Filter inventories
  const filteredInventories = inventories.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    // Only show items with "New" or "Good" condition
    const hasGoodCondition = item.condition === "New" || item.condition === "Good";

    return matchesSearch && matchesCategory && item.quantity > 0 && hasGoodCondition;
  });

  // Get unique categories - only from items with "New" or "Good" condition
  const categories = [
    "all",
    ...new Set(
      inventories
        .filter((item) => (item.condition === "New" || item.condition === "Good") && item.quantity > 0)
        .map((item) => item.category)
    ),
  ];

  const getConditionBadge = (condition) => {
    const badges = {
      New: { bg: "bg-green-100", border: "border-green-300", text: "text-green-800", icon: "🆕" },
      Good: { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800", icon: "✅" },
      Maintenance: { bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-800", icon: "🔧" },
      Damaged: { bg: "bg-red-100", border: "border-red-300", text: "text-red-800", icon: "⚠️" },
    };
    return badges[condition] || badges.Good;
  };

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: COLORS.pageBg, color: COLORS.text }}>
      <style>{modalAnimationStyles}</style>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f2f2f2] via-[#f8faff] to-[#eaf1ff]"></div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(rgba(37,99,235,0.08) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="backdrop-blur-md bg-white border border-[#E6E6E6] rounded-2xl shadow-xl p-6 sm:p-8 mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mr-3 sm:mr-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    Gym Equipment & Resources
                  </h1>
                  <p className="text-gray-600 text-base sm:text-lg mt-2">
                    Browse available gym equipment in Good or New condition
                  </p>
                </div>
              </div>
              <button
                onClick={fetchUserBookings}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap"
              >
                📅 My Bookings
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="🔎 Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-500"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => {
                let bgColor = "from-blue-100 to-blue-50 border-blue-200 text-blue-700";
                let selectedBg = "from-blue-500 to-blue-600 text-white";
                
                if (cat === "Cardio") {
                  bgColor = "from-red-100 to-red-50 border-red-200 text-red-700";
                  selectedBg = "from-red-500 to-red-600 text-white";
                } else if (cat === "Strength") {
                  bgColor = "from-indigo-100 to-indigo-50 border-indigo-200 text-indigo-700";
                  selectedBg = "from-blue-500 to-blue-600 text-white";
                } else if (cat === "Accessories") {
                  bgColor = "from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-700";
                  selectedBg = "from-green-500 to-green-600 text-white";
                } else if (cat === "Yoga") {
                  bgColor = "from-purple-100 to-purple-50 border-purple-200 text-purple-700";
                  selectedBg = "from-purple-500 to-purple-600 text-white";
                } else if (cat === "Weights") {
                  bgColor = "from-amber-100 to-amber-50 border-amber-200 text-amber-700";
                  selectedBg = "from-yellow-500 to-yellow-600 text-white";
                }
                
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full font-medium text-sm border transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === cat
                        ? `bg-gradient-to-r ${selectedBg} shadow-lg`
                        : `bg-gradient-to-r ${bgColor} border hover:opacity-80`
                    }`}
                  >
                    {cat === "all" ? "📦 All" : cat === "Cardio" ? "🏃 " + cat : cat === "Strength" ? "💪 " + cat : cat === "Accessories" ? "🎒 " + cat : cat === "Yoga" ? "🧘 " + cat : cat === "Weights" ? "⚖️ " + cat : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin mb-4">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">Loading equipment...</p>
              </div>
            </div>
          ) : error ? (
            <div className="backdrop-blur-md bg-red-50 border border-red-200 rounded-2xl p-12 text-center">
              <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-semibold">{error}</p>
              <button
                onClick={fetchInventories}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          ) : filteredInventories.length === 0 ? (
            <div className="backdrop-blur-md bg-white border border-[#E6E6E6] rounded-2xl p-12 text-center">
              <svg className="w-12 h-12 text-blue-500 mx-auto mb-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-700 text-lg font-semibold">No equipment found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filter</p>
            </div>
          ) : (
            <>
              {/* Equipment Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {filteredInventories.map((item) => {
                  const badge = getConditionBadge(item.condition);
                  return (
                    <div
                      key={item._id}
                      className="backdrop-blur-md bg-white border border-[#E6E6E6] rounded-xl overflow-hidden hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    >
                      {/* Image */}
                      <div className="h-40 w-full bg-gray-100 overflow-hidden rounded-t-xl">
                        {item.image ? (
                          <img
                            src={`http://localhost:5000/uploads/${item.image}`}
                            alt={item.itemName}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-100">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-lg truncate mb-2">{item.itemName}</h3>

                        {/* Category */}
                        <span className="inline-block px-3 py-1 bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full mb-3">
                          {item.category}
                        </span>

                        {/* Condition */}
                        <div className={`inline-block px-3 py-1 ${badge.bg} border ${badge.border} ${badge.text} text-xs font-semibold rounded-full ml-2 mb-3`}>
                          {badge.icon} {item.condition}
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm text-gray-600 border-t border-gray-200 pt-3 mt-3">
                          <div className="flex justify-between">
                            <span>Available:</span>
                            <span className="font-semibold text-blue-700">{item.quantity} units</span>
                          </div>
                          {item.supplier && (
                            <div className="flex justify-between">
                              <span>Supplier:</span>
                              <span className="font-semibold truncate">{item.supplier}</span>
                            </div>
                          )}
                        </div>

                        {/* Special Details */}
                        {item.specialDetails && (
                          <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                            <p className="text-xs text-gray-500 line-clamp-2">{item.specialDetails}</p>
                          </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => {
                              setSelectedItem(item);
                              openBookingForm();
                            }}
                            className="w-full px-2 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                            📅 Book Equipment
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="backdrop-blur-md bg-white border border-[#E6E6E6] rounded-2xl p-6 text-center">
                <p className="text-gray-700">
                  Found <span className="font-bold text-blue-700">{filteredInventories.length}</span> available equipment
                </p>
              </div>
            </>
          )}
        </div>
      </div>



      {/* MY BOOKINGS MODAL */}
      {showMyBookings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 modal-fade-in">
          <div className="backdrop-blur-md bg-white border border-gray-200 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl modal-pop-in">
            {/* Close Button */}
            <div className="sticky top-0 flex justify-between items-center p-6 bg-white border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                My Bookings
              </h2>
              <button
                onClick={() => setShowMyBookings(false)}
                className="text-gray-500 hover:text-blue-600 text-2xl font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {userBookingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-600">⏳ Loading your bookings...</p>
                </div>
              ) : userBookings.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-600 text-center">
                    <span className="text-2xl mb-2 block">📭</span>
                    You haven't made any bookings yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBookings.map((booking) => {
                    const statusColor = getStatusBadgeColor(booking.status);
                    return (
                      <div key={booking._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{booking.itemName}</h3>
                            <p className="text-sm text-gray-500">Booking ID: {booking._id.slice(-8)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor.bg} border ${statusColor.border} ${statusColor.text}`}>
                            {statusColor.icon} {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                          <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="font-semibold text-gray-900">{booking.quantity} units</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Start Date</p>
                            <p className="font-semibold text-gray-900">{new Date(booking.requestedStartDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">End Date</p>
                            <p className="font-semibold text-gray-900">{new Date(booking.requestedEndDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Purpose</p>
                            <p className="font-semibold text-gray-900 line-clamp-1">{booking.purpose}</p>
                          </div>
                        </div>

                        {booking.adminNotes && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                            <p className="text-sm text-blue-700"><strong>✉️ Admin Notes:</strong> {booking.adminNotes}</p>
                          </div>
                        )}

                        {booking.declinedReason && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-3">
                            <p className="text-sm text-red-300"><strong>❌ Decline Reason:</strong> {booking.declinedReason}</p>
                          </div>
                        )}

                        {booking.approvedDate && (
                          <div className="text-xs text-gray-500">
                            ✅ Approved on {new Date(booking.approvedDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOOKING FORM MODAL */}
      {showBookingForm && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 modal-fade-in">
          <div className="backdrop-blur-md bg-white border border-gray-200 rounded-2xl max-w-md w-full shadow-2xl modal-pop-in">
            {/* Close Button */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-blue-700">Book Equipment</h2>
              <button
                onClick={closeBookingForm}
                className="text-gray-500 hover:text-blue-600 text-2xl font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              {/* Item Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-500">Item:</p>
                <p className="text-lg font-bold text-gray-900">{selectedItem.itemName}</p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={selectedItem.quantity}
                    value={bookingFormData.quantity}
                    onChange={(e) => handleBookingChange("quantity", e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-blue-200 text-gray-900 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-sm text-gray-500">Max: {selectedItem.quantity}</span>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">Purpose of Booking</label>
                <textarea
                  value={bookingFormData.purpose}
                  onChange={(e) => handleBookingChange("purpose", e.target.value)}
                  placeholder="Explain why you need this equipment..."
                  className="w-full px-3 py-2 h-20 bg-white border border-blue-200 text-gray-900 rounded-lg focus:border-blue-500 focus:outline-none resize-none placeholder-gray-400"
                />
              </div>

              {/* Start Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={bookingFormData.startDate}
                    onChange={(e) => handleBookingChange("startDate", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 text-gray-900 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={bookingFormData.startTime}
                    onChange={(e) => handleBookingChange("startTime", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 text-gray-900 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* End Time Only */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">End Time (Same Day)</label>
                <input
                  type="time"
                  value={bookingFormData.endTime}
                  onChange={(e) => handleBookingChange("endTime", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 text-gray-900 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSubmitBooking}
                  disabled={bookingLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-300"
                >
                  {bookingLoading ? "Submitting..." : "Submit Booking"}
                </button>
                <button
                  onClick={closeBookingForm}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayInventorysUser;
