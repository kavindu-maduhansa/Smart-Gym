import React, { useState, useEffect } from "react";
import axios from "axios";

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
      pending: { bg: "bg-yellow-500/20", border: "border-yellow-400/30", text: "text-yellow-300", icon: "⏳" },
      approved: { bg: "bg-green-500/20", border: "border-green-400/30", text: "text-green-300", icon: "✅" },
      declined: { bg: "bg-red-500/20", border: "border-red-400/30", text: "text-red-300", icon: "❌" },
      completed: { bg: "bg-blue-500/20", border: "border-blue-400/30", text: "text-blue-300", icon: "🎉" },
      cancelled: { bg: "bg-gray-500/20", border: "border-gray-400/30", text: "text-gray-300", icon: "🚫" },
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
      New: { bg: "bg-green-500/20", border: "border-green-400/30", text: "text-green-300", icon: "🆕" },
      Good: { bg: "bg-blue-500/20", border: "border-blue-400/30", text: "text-blue-300", icon: "✅" },
      Maintenance: { bg: "bg-yellow-500/20", border: "border-yellow-400/30", text: "text-yellow-300", icon: "🔧" },
      Damaged: { bg: "bg-red-500/20", border: "border-red-400/30", text: "text-red-300", icon: "⚠️" },
    };
    return badges[condition] || badges.Good;
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <style>{modalAnimationStyles}</style>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,127,17,0.1) 1px, transparent 1px), linear-gradient(rgba(255,127,17,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-orange rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="backdrop-blur-md bg-gradient-to-br from-orange/20 to-orange/10 border border-orange/30 rounded-2xl shadow-2xl p-6 sm:p-8 mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-orange mr-3 sm:mr-4"
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
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">
                    Gym Equipment & Resources
                  </h1>
                  <p className="text-gray-300 text-base sm:text-lg mt-2">
                    Browse available gym equipment in Good or New condition
                  </p>
                </div>
              </div>
              <button
                onClick={fetchUserBookings}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50 whitespace-nowrap"
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
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-orange/30 text-white placeholder-gray-400 focus:border-orange focus:outline-none transition duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-orange hover:text-orange/80"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => {
                let bgColor = "from-orange/30 to-orange/20 border-orange/40 text-orange-300";
                let selectedBg = "from-orange to-orange/80 text-white";
                
                if (cat === "Cardio") {
                  bgColor = "from-red-500/30 to-red-600/20 border-red-500/40 text-red-300";
                  selectedBg = "from-red-500 to-red-600 text-white";
                } else if (cat === "Strength") {
                  bgColor = "from-blue-500/30 to-blue-600/20 border-blue-500/40 text-blue-300";
                  selectedBg = "from-blue-500 to-blue-600 text-white";
                } else if (cat === "Accessories") {
                  bgColor = "from-green-500/30 to-green-600/20 border-green-500/40 text-green-300";
                  selectedBg = "from-green-500 to-green-600 text-white";
                } else if (cat === "Yoga") {
                  bgColor = "from-purple-500/30 to-purple-600/20 border-purple-500/40 text-purple-300";
                  selectedBg = "from-purple-500 to-purple-600 text-white";
                } else if (cat === "Weights") {
                  bgColor = "from-yellow-500/30 to-yellow-600/20 border-yellow-500/40 text-yellow-300";
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
                  <svg className="w-12 h-12 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <p className="text-gray-300">Loading equipment...</p>
              </div>
            </div>
          ) : error ? (
            <div className="backdrop-blur-md bg-red-500/20 border border-red-400/30 rounded-2xl p-12 text-center">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300 font-semibold">{error}</p>
              <button
                onClick={fetchInventories}
                className="mt-4 px-4 py-2 bg-orange hover:bg-orange/90 text-white rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          ) : filteredInventories.length === 0 ? (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
              <svg className="w-12 h-12 text-orange mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-300 text-lg font-semibold">No equipment found</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or filter</p>
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
                      className="backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl overflow-hidden hover:border-orange/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange/20"
                    >
                      {/* Image */}
                      <div className="h-40 w-full bg-gray-700/30 overflow-hidden rounded-t-xl">
                        {item.image ? (
                          <img
                            src={`http://localhost:5000/uploads/${item.image}`}
                            alt={item.itemName}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-600/20">
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
                        <h3 className="font-bold text-white text-lg truncate mb-2">{item.itemName}</h3>

                        {/* Category */}
                        <span className="inline-block px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold rounded-full mb-3">
                          {item.category}
                        </span>

                        {/* Condition */}
                        <div className={`inline-block px-3 py-1 ${badge.bg} border ${badge.border} ${badge.text} text-xs font-semibold rounded-full ml-2 mb-3`}>
                          {badge.icon} {item.condition}
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm text-gray-300 border-t border-white/10 pt-3 mt-3">
                          <div className="flex justify-between">
                            <span>Available:</span>
                            <span className="font-semibold text-orange">{item.quantity} units</span>
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
                          <div className="mt-3 p-2 bg-white/5 rounded border border-white/10">
                            <p className="text-xs text-gray-400 line-clamp-2">{item.specialDetails}</p>
                          </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => {
                              setSelectedItem(item);
                              openBookingForm();
                            }}
                            className="w-full px-2 py-1.5 bg-gradient-to-r from-orange to-orange/80 hover:from-orange/90 hover:to-orange/70 text-white font-medium text-sm rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange/50">
                            📅 Book Equipment
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="backdrop-blur-md bg-gradient-to-r from-orange/10 to-orange/5 border border-orange/30 rounded-2xl p-6 text-center">
                <p className="text-gray-300">
                  Found <span className="font-bold text-orange">{filteredInventories.length}</span> available equipment
                </p>
              </div>
            </>
          )}
        </div>
      </div>



      {/* MY BOOKINGS MODAL */}
      {showMyBookings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 modal-fade-in">
          <div className="backdrop-blur-md bg-gradient-to-br from-white/15 to-white/5 border border-white/30 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl modal-pop-in">
            {/* Close Button */}
            <div className="sticky top-0 flex justify-between items-center p-6 bg-gradient-to-r from-black/30 to-transparent border-b border-white/10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                My Bookings
              </h2>
              <button
                onClick={() => setShowMyBookings(false)}
                className="text-gray-300 hover:text-orange text-2xl font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {userBookingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-400">⏳ Loading your bookings...</p>
                </div>
              ) : userBookings.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-400 text-center">
                    <span className="text-2xl mb-2 block">📭</span>
                    You haven't made any bookings yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBookings.map((booking) => {
                    const statusColor = getStatusBadgeColor(booking.status);
                    return (
                      <div key={booking._id} className="bg-gray-800/50 border border-orange/20 rounded-lg p-4 hover:border-orange/50 transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-white">{booking.itemName}</h3>
                            <p className="text-sm text-gray-400">Booking ID: {booking._id.slice(-8)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor.bg} border ${statusColor.border} ${statusColor.text}`}>
                            {statusColor.icon} {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                          <div>
                            <p className="text-gray-400">Quantity</p>
                            <p className="font-semibold text-white">{booking.quantity} units</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Start Date</p>
                            <p className="font-semibold text-white">{new Date(booking.requestedStartDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">End Date</p>
                            <p className="font-semibold text-white">{new Date(booking.requestedEndDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Purpose</p>
                            <p className="font-semibold text-white line-clamp-1">{booking.purpose}</p>
                          </div>
                        </div>

                        {booking.adminNotes && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 mb-3">
                            <p className="text-sm text-blue-300"><strong>✉️ Admin Notes:</strong> {booking.adminNotes}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 modal-fade-in">
          <div className="backdrop-blur-md bg-gradient-to-br from-white/15 to-white/5 border border-white/30 rounded-2xl max-w-md w-full shadow-2xl modal-pop-in">
            {/* Close Button */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-orange">Book Equipment</h2>
              <button
                onClick={closeBookingForm}
                className="text-gray-300 hover:text-orange text-2xl font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              {/* Item Info */}
              <div className="p-3 bg-orange/10 border border-orange/30 rounded-lg">
                <p className="text-sm text-gray-400">Item:</p>
                <p className="text-lg font-bold text-white">{selectedItem.itemName}</p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={selectedItem.quantity}
                    value={bookingFormData.quantity}
                    onChange={(e) => handleBookingChange("quantity", e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border border-orange/30 text-white rounded-lg focus:border-orange focus:outline-none"
                  />
                  <span className="text-sm text-gray-400">Max: {selectedItem.quantity}</span>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Purpose of Booking</label>
                <textarea
                  value={bookingFormData.purpose}
                  onChange={(e) => handleBookingChange("purpose", e.target.value)}
                  placeholder="Explain why you need this equipment..."
                  className="w-full px-3 py-2 h-20 bg-white/10 border border-orange/30 text-white rounded-lg focus:border-orange focus:outline-none resize-none placeholder-gray-500"
                />
              </div>

              {/* Start Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={bookingFormData.startDate}
                    onChange={(e) => handleBookingChange("startDate", e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-orange/30 text-white rounded-lg focus:border-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={bookingFormData.startTime}
                    onChange={(e) => handleBookingChange("startTime", e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-orange/30 text-white rounded-lg focus:border-orange focus:outline-none"
                  />
                </div>
              </div>

              {/* End Time Only */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">End Time (Same Day)</label>
                <input
                  type="time"
                  value={bookingFormData.endTime}
                  onChange={(e) => handleBookingChange("endTime", e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-orange/30 text-white rounded-lg focus:border-orange focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={handleSubmitBooking}
                  disabled={bookingLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange to-orange/80 hover:from-orange/90 hover:to-orange/70 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-300"
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
