import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useSocket } from "../provider/SocketProvider";
// import socket from "../socket";

function HomeRequestCard({ requests }) {
  const [currentUserId, setCurrentUserId] = useState("");
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get("http://localhost:3000/api/user", {
        withCredentials: true,
      });
      setCurrentUserId(res.data.user._id);
      // socket.emit("join_room", res.data.user._id);
    };
    fetchUser();
  }, []);
  
  const handleAccept = async (request) => {
    try {
      const res = await axios.post(`http://localhost:3000/api/acceptRequest/${request._id}`, {}, {
        withCredentials: true,
      });
      
      console.log(res);

      // socket.emit("send_notification", {
      //   senderId: currentUserId,
      //   receiverId: request.requester._id,
      //   message: "Your request has been accepted!",
      // });

      socket.emit("send_message", {
        senderId: currentUserId,
        receiverId: request.requester._id,
        message: "Hi! I’ve accepted your request, let’s chat!",
      });
  
      // Navigate to inbox with user ID to auto-select the chat
      navigate("/inbox", { 
        state: { 
          selectUserId: request.requester._id,
          userName: request.requester.name,
          requestId: request._id
        } 
      });
    } catch (err) {
      alert(err.response ? err.response.data.message : "An error occurred while accepting the request.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        📌 Latest Requests
      </h1>

      {requests.length === 0 ? (
        <p className="text-gray-500">No requests available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="space-y-1 mb-4">
                <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-1">
                  📖 {request.task}
                </h2>
                <p className="text-gray-600 font-medium">
                  💸 Offer:{" "}
                  <span className="text-green-600">{request.offer}</span>
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to={`/user/${request.requester._id}`}
                  className="flex items-center gap-2"
                >
                  <img
                    src={`http://localhost:3000/images/uploads/${request.requester.profilepic}`}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {request.requester.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(request.createdAt), "dd MMM yyyy")}
                    </p>
                  </div>
                </Link>

                <div
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    request.isAccepted
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {request.isAccepted ? "Accepted" : "Pending"}
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => handleAccept(request)}
                  disabled={request.isAccepted}
                  className={`flex items-center justify-center gap-1 w-full text-sm font-medium px-3 py-1.5 rounded-md transition border 
                  ${
                    request.isAccepted
                      ? "bg-green-50 text-green-600 border-green-200 cursor-not-allowed"
                      : "bg-white text-green-600 border-green-500 hover:bg-green-500 hover:text-white"
                  }`}
                >
                  ✅ {request.isAccepted ? "Accepted" : "Accept"}
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