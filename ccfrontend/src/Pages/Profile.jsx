import { useEffect, useState } from "react";
import axios from "axios";
import ProfileCard from "../components/ProfileCard";
import RequestCard from "../components/RequestCard";
import AddRequest from "../components/AddRequest";
import FulfilledRequests from "../components/FulfilledRequests";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/user", {
        withCredentials: true,
      });
      setUser(res.data);
    } catch (err) {
      console.error("Fetch user error:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      <ProfileCard user={user} fetchUser={fetchUser} />

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Requests</h2>
        <RequestCard user={user} fetchUser={fetchUser} />
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setActive(true)}
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Add New Request
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Requests You Fulfilled</h2>
        <FulfilledRequests user={user} />
      </div>

      {active && (
        <AddRequest
          onClose={() => setActive(false)}
          onRequestAdded={() => {
            fetchUser();
            setActive(false);
          }}
        />
      )}

    </div>
  );
}
