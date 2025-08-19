import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useSocket } from "../provider/SocketProvider";
import { FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";

function HomeRequestCard({ requests }) {
  const [currentUserId, setCurrentUserId] = useState("");
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    const fetchUser = async () => {
      const res= await axios
      .get(`${import.meta.env.VITE_API}/api/user`, {
        withCredentials:true,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      })
      setCurrentUserId(res.data.user._id);
    };
    fetchUser();
  }, []);

  const handleAccept = async (request) => {
    try {
      await axios
      .post(`${import.meta.env.VITE_API}/api/acceptRequest/${request._id}`, {}, {
        withCredentials:true,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },

      })

      await axios.post(
        `${import.meta.env.VITE_API}/api/relevantUsers`,
        { userId: request.requester._id },
        {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        }
      );

      socket.emit("send_message", {
        senderId: currentUserId,
        receiverId: request.requester._id,
        message: "Hi! I’ve accepted your request, let’s chat!",
      });

      navigate("/inbox", {
        state: {
          selectUserId: request.requester._id,
          userName: request.requester.name,
          requestId: request._id,
        },
      });
    } catch (err) {
      toast.error(
        err.response
          ? err.response.data.message
          : "An error occurred while accepting the request."
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 space-y-6">
      <h1 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4">
        📌 Latest Requests
      </h1>

      {requests.length === 0 ? (
        <p className="text-gray-500 text-center">No requests available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...requests]
            .sort((a, b) => {
              if (a.isAccepted === b.isAccepted) return 0;
              return a.isAccepted ? 1 : -1;
            })
            .map((request) => (
              <div
                key={request._id}
                className="relative bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg transition duration-300 flex flex-col justify-between h-auto"
              >
                <div className="space-y-1 mb-2">
                  <h2 className="text-[15px] sm:text-[17px] font-semibold text-gray-800">
                    📖 {request.task}
                  </h2>
                  <p className="text-gray-600 text-[13px] sm:text-[14px]">
                    💸 Offer:{" "}
                    <span className="text-green-600 font-medium">{request.offer}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <Link
                    to={`/user/${request.requester._id}`}
                    className="flex items-center gap-2"
                  >
                    <img
                      src={request.requester.profilepic }
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover border"
                    />
                    <div>
                      <p className="text-[12px] sm:text-[13px] font-medium text-gray-800">
                        {request.requester.name}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-gray-500">
                        {format(new Date(request.createdAt), "dd MMM yyyy")}
                      </p>
                    </div>
                  </Link>

                  <span
                    className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                      request.isAccepted
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                    }`}
                  >
                    {request.isAccepted ? "Completed" : "Pending"}
                  </span>
                </div>

                <div className="mt-4 flex justify-start">
                  <button
                    onClick={() => handleAccept(request)}
                    disabled={request.isAccepted}
                    className={`flex items-center gap-2 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200 border
                      ${
                        request.isAccepted
                          ? "bg-green-50 text-green-600 border-green-200 cursor-not-allowed"
                          : "bg-white text-green-600 border-green-500 hover:bg-green-500 hover:text-white"
                      }`}
                  >
                    <FaCheck className="text-[13px]" />
                    {request.isAccepted ? "Accepted" : "Accept"}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default HomeRequestCard;
