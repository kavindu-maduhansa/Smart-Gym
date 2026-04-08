import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import RecentActivity from "../components/RecentActivity";

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

const AdminInventoryDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalItems: 0,
    available: 0,
    damaged: 0,
    maintenance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState("pending");
  const [mostBookedItems, setMostBookedItems] = useState([]);
  const [showMostBookedModal, setShowMostBookedModal] = useState(false);
  const [mostBookedLoading, setMostBookedLoading] = useState(false);

  useEffect(() => {
    fetchInventoryStats();
  }, []);

  const fetchInventoryStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/inventory");
      const items = res.data.data;

      const totalItems = items.length;
      const available = items.filter((item) => item.quantity > 0 && (item.condition === "Good" || item.condition === "New")).length;
      const damaged = items.filter((item) => item.condition === "Damaged").length;
      const maintenance = items.filter((item) => item.condition === "Maintenance").length;

      setStats({
        totalItems,
        available,
        damaged,
        maintenance,
      });
    } catch (err) {
      console.error("Failed to fetch inventory stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    try {
      setReportLoading(true);
      const res = await axios.get("http://localhost:5000/api/inventory");
      setReportData(res.data.data);
      setShowReportModal(true);
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      alert("Failed to load inventory data for report");
    } finally {
      setReportLoading(false);
    }
  };

  const downloadCSVReport = async () => {
    if (reportData.length === 0) {
      alert("No data to download");
      return;
    }

    // Fetch bookings for most booked items section
    let mostBookedItemsData = [];
    try {
      const res = await axios.get("http://localhost:5000/api/bookings");
      const allBookings = res.data.data || [];

      // Count bookings by item
      const itemCounts = {};
      allBookings.forEach((booking) => {
        const key = booking.itemName || "Unknown";
        itemCounts[key] = (itemCounts[key] || 0) + 1;
      });

      // Convert to array and sort by count
      mostBookedItemsData = Object.entries(itemCounts)
        .map(([itemName, count]) => ({
          itemName,
          bookingCount: count,
        }))
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 10); // Top 10
    } catch (err) {
      console.error("Failed to fetch bookings data:", err);
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Define colors
    const orangeColor = [255, 127, 17]; // #FF7F11
    const darkBg = [30, 30, 30];
    const lightText = [200, 200, 200];
    const white = [255, 255, 255];

    // Background
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // ====== HEADER SECTION ======
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(...orangeColor);
    doc.text("INVENTORY REPORT", margin, yPosition);
    yPosition += 12;

    // Gym Name
    doc.setFontSize(12);
    doc.setTextColor(...lightText);
    doc.setFont("helvetica", "normal");
    doc.text("Smart Gym Management System", margin, yPosition);
    yPosition += 6;

    // Report Date
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const reportDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Generated: ${reportDate}`, margin, yPosition);

    // Orange line separator
    yPosition += 8;
    doc.setDrawColor(...orangeColor);
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // ====== SUMMARY SECTION ======
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...orangeColor);
    doc.text("SUMMARY STATISTICS", margin, yPosition);
    yPosition += 8;

    const summary = generateSummary();

    // Summary boxes
    const boxWidth = (pageWidth - margin * 2 - 6) / 4;
    const boxHeight = 20;
    const summaryData = [
      { label: "Total Items", value: summary.total, color: [255, 127, 17] },
      { label: "Total Quantity", value: summary.totalQuantity, color: [59, 130, 246] },
      { label: "Good/New", value: summary.byCondition.Good + summary.byCondition.New, color: [34, 197, 94] },
      { label: "Issues", value: summary.byCondition.Damaged + summary.byCondition.Maintenance, color: [239, 68, 68] },
    ];

    let boxX = margin;
    summaryData.forEach((item) => {
      // Box background
      doc.setFillColor(...item.color);
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(boxX, yPosition, boxWidth, boxHeight, "S");

      // Label
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "normal");
      doc.text(item.label, boxX + 3, yPosition + 6);

      // Value
      doc.setFontSize(14);
      doc.setTextColor(...item.color);
      doc.setFont("helvetica", "bold");
      doc.text(String(item.value), boxX + 3, yPosition + 16);

      boxX += boxWidth + 2;
    });

    yPosition += boxHeight + 10;

    // ====== CONDITION BREAKDOWN ======
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...orangeColor);
    doc.text("ITEMS BY CONDITION", margin, yPosition);
    yPosition += 6;

    const conditions = [
      { name: "Good", count: summary.byCondition.Good, color: [34, 197, 94] },
      { name: "New", count: summary.byCondition.New, color: [59, 130, 246] },
      { name: "Damaged", count: summary.byCondition.Damaged, color: [239, 68, 68] },
      { name: "Maintenance", count: summary.byCondition.Maintenance, color: [251, 146, 60] },
    ];

    doc.setFontSize(10);
    conditions.forEach((cond) => {
      // Condition bar
      const barWidth = 80;
      const barHeight = 5;
      doc.setDrawColor(...cond.color);
      doc.setFillColor(...cond.color);

      // Calculate percentage
      const percentage = (cond.count / summary.total) * 100 || 0;
      const fillWidth = (barWidth / 100) * percentage;

      // Background bar
      doc.setDrawColor(80, 80, 80);
      doc.rect(margin + 30, yPosition, barWidth, barHeight, "S");

      // Fill bar
      doc.setFillColor(...cond.color);
      doc.rect(margin + 30, yPosition, fillWidth, barHeight, "F");

      // Label and value
      doc.setTextColor(...lightText);
      doc.setFont("helvetica", "normal");
      doc.text(`${cond.name}:`, margin, yPosition + 4);

      doc.setTextColor(...cond.color);
      doc.setFont("helvetica", "bold");
      doc.text(`${cond.count} (${percentage.toFixed(1)}%)`, margin + barWidth + 32, yPosition + 4);

      yPosition += 8;
    });

    yPosition += 5;

    // ====== INVENTORY TABLE ======
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...orangeColor);
    doc.text("COMPLETE INVENTORY LIST", margin, yPosition);
    yPosition += 7;

    // Table headers
    const tableStartY = yPosition;
    const rowHeight = 6;
    const colWidths = {
      name: 40,
      category: 25,
      qty: 15,
      condition: 20,
      supplier: 30,
    };

    const headers = ["Item Name", "Category", "Qty", "Condition", "Supplier"];
    const colKeys = ["name", "category", "qty", "condition", "supplier"];

    // Header background
    doc.setFillColor(40, 40, 40);
    doc.rect(margin, yPosition - 4, pageWidth - margin * 2, rowHeight + 2, "F");

    // Header text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...orangeColor);

    let headerX = margin + 2;
    headers.forEach((header, idx) => {
      doc.text(header, headerX, yPosition);
      headerX += colWidths[colKeys[idx]];
    });

    yPosition += rowHeight + 1;

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    reportData.forEach((item, idx) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        doc.setFillColor(20, 20, 20);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        yPosition = margin;
      }

      // Alternating row background
      if (idx % 2 === 0) {
        doc.setFillColor(30, 30, 30);
        doc.rect(margin, yPosition - 3, pageWidth - margin * 2, rowHeight + 1, "F");
      }

      // Condition color
      let conditionColor = lightText;
      if (item.condition === "Good") conditionColor = [34, 197, 94];
      else if (item.condition === "New") conditionColor = [59, 130, 246];
      else if (item.condition === "Damaged") conditionColor = [239, 68, 68];
      else if (item.condition === "Maintenance") conditionColor = [251, 146, 60];

      doc.setTextColor(...lightText);
      let cellX = margin + 2;

      // Item Name
      doc.text(item.itemName.substring(0, 20), cellX, yPosition);
      cellX += colWidths.name;

      // Category
      doc.text(item.category || "N/A", cellX, yPosition);
      cellX += colWidths.category;

      // Quantity
      doc.setTextColor(59, 130, 246);
      doc.text(String(item.quantity), cellX, yPosition);
      cellX += colWidths.qty;

      // Condition
      doc.setTextColor(...conditionColor);
      doc.setFont("helvetica", "bold");
      doc.text(item.condition, cellX, yPosition);
      cellX += colWidths.condition;

      // Supplier
      doc.setTextColor(...lightText);
      doc.setFont("helvetica", "normal");
      doc.text((item.supplier || "N/A").substring(0, 18), cellX, yPosition);

      yPosition += rowHeight + 2;
    });

    // ====== MOST BOOKED ITEMS SECTION ======
    if (mostBookedItemsData.length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        doc.setFillColor(20, 20, 20);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        yPosition = margin;
      }

      yPosition += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...orangeColor);
      doc.text("TOP 10 MOST BOOKED EQUIPMENT", margin, yPosition);
      yPosition += 7;

      // Table headers for most booked
      doc.setFillColor(40, 40, 40);
      doc.rect(margin, yPosition - 4, pageWidth - margin * 2, 6, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...orangeColor);
      doc.text("Rank", margin + 2, yPosition);
      doc.text("Equipment Name", margin + 12, yPosition);
      doc.text("Total Bookings", margin + 80, yPosition);

      yPosition += 8;

      // Most booked items rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      mostBookedItemsData.forEach((item, idx) => {
        if (yPosition > pageHeight - 15) {
          doc.addPage();
          doc.setFillColor(20, 20, 20);
          doc.rect(0, 0, pageWidth, pageHeight, "F");
          yPosition = margin;

          // Repeat header on new page
          doc.setFillColor(40, 40, 40);
          doc.rect(margin, yPosition - 4, pageWidth - margin * 2, 6, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(...orangeColor);
          doc.text("Rank", margin + 2, yPosition);
          doc.text("Equipment Name", margin + 12, yPosition);
          doc.text("Total Bookings", margin + 80, yPosition);
          yPosition += 8;
          doc.setFont("helvetica", "normal");
        }

        // Alternating row background
        if (idx % 2 === 0) {
          doc.setFillColor(30, 30, 30);
          doc.rect(margin, yPosition - 4, pageWidth - margin * 2, 6, "F");
        }

        // Rank with color
        doc.setTextColor(...orangeColor);
        doc.setFont("helvetica", "bold");
        doc.text(`#${idx + 1}`, margin + 2, yPosition);

        // Equipment name
        doc.setTextColor(...lightText);
        doc.setFont("helvetica", "normal");
        doc.text(item.itemName.substring(0, 50), margin + 12, yPosition);

        // Booking count
        doc.setTextColor(59, 130, 246);
        doc.setFont("helvetica", "bold");
        doc.text(String(item.bookingCount), margin + 80, yPosition);

        yPosition += 7;
      });
    }

    // ====== FOOTER ======
    yPosition += 10;
    doc.setDrawColor(...orangeColor);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Smart Gym Management System | Confidential Report", margin, yPosition);

    doc.setTextColor(80, 80, 80);
    doc.text(
      `Page 1 of ${doc.internal.pages.length}`,
      pageWidth - margin - 20,
      yPosition
    );

    // Save PDF
    doc.save(`Inventory_Report_${new Date().toLocaleDateString()}.pdf`);
  };

  const fetchBookings = async (status = "pending") => {
    try {
      setBookingsLoading(true);
      const res = await axios.get(`http://localhost:5000/api/bookings/status/${status}`);
      setBookings(res.data.data || []);
      setShowBookingsModal(true);
      setBookingFilter(status);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      alert("Failed to load bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchMostBookedItems = async () => {
    try {
      setMostBookedLoading(true);
      const res = await axios.get("http://localhost:5000/api/bookings");
      const allBookings = res.data.data || [];

      // Count bookings by item
      const itemCounts = {};
      allBookings.forEach((booking) => {
        const key = booking.itemName || "Unknown";
        itemCounts[key] = (itemCounts[key] || 0) + 1;
      });

      // Convert to array and sort by count
      const sorted = Object.entries(itemCounts)
        .map(([itemName, count]) => ({
          itemName,
          bookingCount: count,
        }))
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 10); // Top 10

      setMostBookedItems(sorted);
      setShowMostBookedModal(true);
    } catch (err) {
      console.error("Failed to fetch most booked items:", err);
      alert("Failed to load most booked items");
    } finally {
      setMostBookedLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      const adminNotes = prompt("Add notes (optional):", "");
      if (adminNotes === null) return;

      const res = await axios.put(
        `http://localhost:5000/api/bookings/approve/${bookingId}`,
        {
          adminNotes: adminNotes,
          adminId: "admin123",
        }
      );

      alert("Booking approved successfully!");
      setBookings(bookings.map((b) => (b._id === bookingId ? res.data.data : b)));
    } catch (err) {
      console.error("Failed to approve booking:", err);
      alert(err.response?.data?.message || "Failed to approve booking");
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    try {
      const reason = prompt("Please provide a reason for declining:");
      if (!reason) {
        alert("Reason is required");
        return;
      }

      const res = await axios.put(
        `http://localhost:5000/api/bookings/decline/${bookingId}`,
        {
          declinedReason: reason,
        }
      );

      alert("Booking declined successfully!");
      setBookings(bookings.map((b) => (b._id === bookingId ? res.data.data : b)));
    } catch (err) {
      console.error("Failed to decline booking:", err);
      alert(err.response?.data?.message || "Failed to decline booking");
    }
  };

  const getDuplicateBookingIds = () => {
    const duplicates = new Set();
    for (let i = 0; i < bookings.length; i++) {
      for (let j = i + 1; j < bookings.length; j++) {
        if (
          bookings[i].itemName === bookings[j].itemName &&
          bookings[i].quantity === bookings[j].quantity &&
          bookings[i].userId !== bookings[j].userId
        ) {
          duplicates.add(bookings[i]._id);
          duplicates.add(bookings[j]._id);
        }
      }
    }
    return duplicates;
  };

  const generateSummary = () => {
    const total = reportData.length;
    const totalQuantity = reportData.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const byCondition = {
      Good: reportData.filter((item) => item.condition === "Good").length,
      New: reportData.filter((item) => item.condition === "New").length,
      Damaged: reportData.filter((item) => item.condition === "Damaged").length,
      Maintenance: reportData.filter((item) => item.condition === "Maintenance").length,
    };

    return { total, totalQuantity, byCondition };
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const cards = [
    {
      title: "Add Machine",
      desc: "Create new entry for machine and target components",
      btn: "Add Item",
      onClick: () => handleNavigation("/admin/add-item"),
      icon: "M12 4v16m8-8H4",
    },
    {
      title: "Manage Machines",
      desc: "Edit and update existing equipment",
      btn: "Manage",
      onClick: () => handleNavigation("/admin/manage"),
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      title: "All Inventories",
      desc: "View complete inventory list",
      btn: "View All",
      onClick: () => handleNavigation("/admin/inventory"),
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    },
    {
      title: "Generate Report",
      desc: "Create inventory reports and analytics",
      btn: "Generate",
      onClick: () => fetchReportData(),
      icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      title: "Manage Bookings",
      desc: "Review and approve equipment bookings",
      btn: "View",
      onClick: () => fetchBookings("pending"),
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-900 overflow-hidden">
      <style>{modalAnimationStyles}</style>
      {/* Animated Background — matches Home.jsx */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)", backgroundSize: "50px 50px" }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

          {/* Welcome Section */}
          <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-blue-600/10 border border-blue-600/30 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 sm:mb-12">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6c0-.6.4-1 1-1h2M4 8v8M4 8h2m14-2V6c0-.6-.4-1-1-1h-2m4 2v8m0-8h-2M4 16v2c0 .6.4 1 1 1h2m-3-3h2m14 3v2c0 .6-.4 1-1 1h-2m4-3h-2M8 7h8m-8 0a2 2 0 00-2 2v6a2 2 0 002 2m0-10v10m8-10v10m0-10a2 2 0 012 2v6a2 2 0 01-2 2m-4-5h.01" />
              </svg>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">Inventory Management</h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-slate-700">
              Manage gym equipment and inventory efficiently
            </p>
          </div>

          {/* Action Cards — homepage-style feature tiles */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">Quick Actions</h2>
            <p className="text-slate-600 text-sm sm:text-base mb-6 sm:mb-8">Jump to common inventory tasks</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              {cards.map((card, i) => (
                <div
                  key={i}
                  onClick={card.onClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      card.onClick();
                    }
                  }}
                  className="group relative backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 sm:p-7 hover:bg-white hover:border-blue-600/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-600/15 cursor-pointer flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <div className="absolute inset-0 rounded-2xl border border-blue-600/0 group-hover:border-blue-600/40 transition-all duration-300 pointer-events-none" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-600/15 rounded-xl flex-shrink-0 group-hover:bg-blue-600/25 transition-colors duration-300 mb-4">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                      </svg>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mb-4 flex-grow">
                      {card.desc}
                    </p>
                    <span className="w-full inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg transition-all duration-300 text-xs sm:text-sm mt-auto min-h-[44px]">
                      {card.btn}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LOWER SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-12 sm:mt-16">

            {/* RECENT ACTIVITY */}
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 hover:border-blue-300/60 hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Activity
                </h3>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-blue-600 hover:text-blue-600/80 transition font-semibold flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              <RecentActivity />
            </div>

            {/* STATS */}
            <div className="backdrop-blur-md bg-slate-100 border border-slate-300 rounded-2xl p-6 hover:border-blue-300/60 hover:shadow-md transition-all">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Inventory Stats
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-slate-500 font-medium">⏳ Loading stats...</p>
                </div>
              ) : (
                <div className="space-y-4">

                  <div className="flex justify-between items-center p-4 bg-white border border-blue-200 rounded-xl shadow-sm hover:border-blue-300 transition">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Total Items
                    </span>
                    <span className="text-2xl font-bold text-blue-600">{stats.totalItems}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white border border-emerald-200 rounded-xl shadow-sm hover:border-emerald-300 transition">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Available
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">{stats.available}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white border border-red-200 rounded-xl shadow-sm hover:border-red-300 transition">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4v2m-6-4h.01H3m6 0h.01m6 0h.01m6 0h.01M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                      </svg>
                      Damaged Items
                    </span>
                    <span className="text-2xl font-bold text-red-600">{stats.damaged}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white border border-amber-200 rounded-xl shadow-sm hover:border-amber-300 transition">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Maintenance
                    </span>
                    <span className="text-2xl font-bold text-amber-600">{stats.maintenance}</span>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-pop-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Inventory Report
              </h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-500 hover:text-slate-900 transition rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Close report"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {reportLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">⏳ Loading report data...</p>
              </div>
            ) : (
              <>
                {/* SUMMARY SECTION */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Report Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-slate-600 text-sm">Total Items</p>
                      <p className="text-2xl font-bold text-blue-600">{generateSummary().total}</p>
                    </div>
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                      <p className="text-slate-600 text-sm">Total Quantity</p>
                      <p className="text-2xl font-bold text-sky-700">{generateSummary().totalQuantity}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <p className="text-slate-600 text-sm">Good/New</p>
                      <p className="text-2xl font-bold text-emerald-700">{generateSummary().byCondition.Good + generateSummary().byCondition.New}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-slate-600 text-sm">Damaged/Maint.</p>
                      <p className="text-2xl font-bold text-red-700">{generateSummary().byCondition.Damaged + generateSummary().byCondition.Maintenance}</p>
                    </div>
                  </div>
                </div>

                {/* CONDITION BREAKDOWN */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Items by Condition</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-700">Good Condition:</span>
                      <span className="font-bold text-emerald-600">{generateSummary().byCondition.Good}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-700">New:</span>
                      <span className="font-bold text-emerald-600">{generateSummary().byCondition.New}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-700">Damaged:</span>
                      <span className="font-bold text-red-600">{generateSummary().byCondition.Damaged}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-700">Maintenance:</span>
                      <span className="font-bold text-amber-600">{generateSummary().byCondition.Maintenance}</span>
                    </div>
                  </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Complete Inventory List</h3>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 px-3 text-blue-700 font-semibold">Item Name</th>
                          <th className="text-left py-2 px-3 text-blue-700 font-semibold">Category</th>
                          <th className="text-center py-2 px-3 text-blue-700 font-semibold">Qty</th>
                          <th className="text-left py-2 px-3 text-blue-700 font-semibold">Condition</th>
                          <th className="text-left py-2 px-3 text-blue-700 font-semibold">Supplier</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-blue-50/50 transition bg-white">
                            <td className="py-3 px-3 text-slate-800">{item.itemName}</td>
                            <td className="py-3 px-3 text-slate-800">{item.category}</td>
                            <td className="py-3 px-3 text-center text-slate-800">{item.quantity}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                item.condition === "Good" ? "bg-emerald-100 text-emerald-800" :
                                item.condition === "New" ? "bg-blue-100 text-blue-800" :
                                item.condition === "Damaged" ? "bg-red-100 text-red-800" :
                                "bg-amber-100 text-amber-800"
                              }`}>
                                {item.condition}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-800">{item.supplier || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-200 pt-6">
                  <button
                    onClick={downloadCSVReport}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </button>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-2.5 px-4 rounded-lg border border-slate-300 transition"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* BOOKINGS MODAL */}
      {showBookingsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-pop-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Equipment Bookings
              </h2>
              <button
                onClick={() => setShowBookingsModal(false)}
                className="text-slate-500 hover:text-slate-900 transition rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Close bookings"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4 flex-wrap">
              {["pending", "approved", "declined"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => fetchBookings(status)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition capitalize min-h-[40px] ${
                    bookingFilter === status
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Content */}
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">⏳ Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">No bookings found for this status</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const duplicateIds = getDuplicateBookingIds();
                  const isDuplicate = duplicateIds.has(booking._id);
                  const borderClass = isDuplicate 
                    ? "border-blue-400 bg-blue-50" 
                    : "border-slate-200 bg-white";
                  
                  return (
                    <div key={booking._id} className={`${borderClass} border rounded-xl p-4 hover:border-blue-300 transition shadow-sm`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">{booking.itemName}</h3>
                            {isDuplicate && (
                              <span className="px-2 py-1 bg-blue-100 border border-blue-300 text-blue-800 text-xs font-bold rounded-full">
                                ⚠️ Duplicate Request
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            User: <span className="font-semibold text-blue-700">{booking.userName}</span> ({booking.userEmail})
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          booking.status === "approved"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : booking.status === "declined"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-amber-100 text-amber-900 border border-amber-200"
                        }`}>
                          {booking.status}
                        </span>
                      </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-slate-500">Quantity</p>
                        <p className="font-semibold text-slate-900">{booking.quantity} units</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Start Date</p>
                        <p className="font-semibold text-slate-900">{new Date(booking.requestedStartDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">End Date</p>
                        <p className="font-semibold text-slate-900">{new Date(booking.requestedEndDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Purpose</p>
                        <p className="font-semibold text-slate-900 line-clamp-1">{booking.purpose}</p>
                      </div>
                    </div>

                    {booking.adminNotes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-slate-800"><strong>Admin Notes:</strong> {booking.adminNotes}</p>
                      </div>
                    )}

                    {booking.declinedReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-800"><strong>Decline Reason:</strong> {booking.declinedReason}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {booking.status === "pending" && (
                      <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => handleApproveBooking(booking._id)}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => handleDeclineBooking(booking._id)}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Decline
                        </button>
                      </div>
                    )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {/* MOST BOOKED ITEMS MODAL */}
      {showMostBookedModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-pop-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Most Booked Equipment
              </h2>
              <button
                onClick={() => setShowMostBookedModal(false)}
                className="text-slate-500 hover:text-slate-900 transition rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Close most booked list"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            {mostBookedLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">⏳ Loading most booked items...</p>
              </div>
            ) : mostBookedItems.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-500">No booking data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mostBookedItems.map((item, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold text-blue-700 bg-blue-100 border border-blue-200 rounded-full w-10 h-10 flex items-center justify-center">
                            #{index + 1}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900">{item.itemName}</h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Total Bookings</p>
                        <p className="text-3xl font-bold text-blue-600">{item.bookingCount}</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
                        style={{
                          width: `${(item.bookingCount / mostBookedItems[0].bookingCount) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {mostBookedItems.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-600 text-center">
                  📊 Showing top <span className="text-blue-700 font-bold">{mostBookedItems.length}</span> most booked equipment items
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryDashboard;



