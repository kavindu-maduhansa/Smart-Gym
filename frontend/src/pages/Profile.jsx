import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setUser(response.data);
      } catch (err) {
        setError(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "Failed to load profile.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-black pt-24 relative flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-80 -z-10"></div>
      <div className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-90 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-orange">
          Profile
        </h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : user ? (
          <div className="space-y-4">
            <div>
              <span className="font-semibold">Name:</span> {user.name}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-semibold">Role:</span> {user.role}
            </div>
            <div>
              <span className="font-semibold">Membership Type:</span>{" "}
              {user.membershipType}
            </div>
            <div>
              <span className="font-semibold">Membership Expiry:</span>{" "}
              {user.membershipExpiry}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Profile;
