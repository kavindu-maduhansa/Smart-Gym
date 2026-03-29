import { useEffect, useState } from "react";
import axios from "axios";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
    // Refresh activity every 30 seconds
    const interval = setInterval(fetchRecentActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/inventory/activity/recent?limit=8"
      );
      setActivities(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch recent activity:", err);
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    return action === "Added" ? "text-green-700" : "text-blue-600";
  };

  const getActionIcon = (action) => {
    return action === "Added" ? "✨" : "✏️";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return "🟢";
      case "out_of_stock":
        return "🔴";
      case "under_maintenance":
        return "🟠";
      default:
        return "⚪";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Cardio":
        return "bg-red-100 text-red-700";
      case "Strength":
        return "bg-blue-100 text-blue-700";
      case "Accessories":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-blue-600">
          📊 Recent Activity
        </h3>
        <button
          onClick={fetchRecentActivity}
          className="text-slate-500 hover:text-blue-600 transition text-sm"
          title="Refresh"
        >
          🔄 Refresh
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-center text-slate-500">Loading...</p>
      ) : activities.length === 0 ? (
        <p className="text-center text-slate-500">No recent activity</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 hover:bg-blue-100 transition"
            >
              {/* ROW 1: Action, Item Name, Time */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3 flex-1">
                  {/* ACTION ICON */}
                  <span className="text-xl">
                    {getActionIcon(activity.action)}
                  </span>

                  {/* ITEM NAME */}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {activity.itemName}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(
                        activity.category
                      )}`}
                    >
                      {activity.category}
                    </span>
                  </div>
                </div>

                {/* TIME AGO */}
                <div className="text-right">
                  <p className="text-xs text-slate-500">{activity.timeAgo}</p>
                  <p className={`text-sm font-bold ${getActionColor(activity.action)}`}>
                    {activity.action}
                  </p>
                </div>
              </div>

              {/* ROW 2: Details */}
              <div className="flex justify-between items-center text-sm text-slate-700 mt-2">
                <div className="flex gap-4">
                  <div>
                    <span className="text-slate-500">Qty:</span>
                    <span className="ml-1 font-semibold">{activity.quantity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Condition:</span>
                    <span className="ml-1 font-semibold">{activity.condition}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span>{getStatusIcon(activity.status)}</span>
                  <span className="capitalize text-slate-500">
                    {activity.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentActivity;
