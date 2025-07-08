import { FaTrash } from "react-icons/fa";
import axios from "axios";
import { useSocket } from "../provider/SocketProvider";
import { useNavigate } from "react-router-dom";

const RequestCard = ({ user, fetchUser, showDelete = true }) => {
  const socket = useSocket();
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this request?")) {
        await axios.delete(`http://localhost:3000/api/request/${id}`, {
          withCredentials: true,
        });
        fetchUser();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleAccept = async (request) => {
    try {
      await axios.post(
        `http://localhost:3000/api/acceptRequest/${request._id}`,
        {},
        {
          withCredentials: true,
        }
      );

      socket.emit("send_message", {
        senderId: user.user._id,
        receiverId: request.requester._id,
        message: "Hi! I’ve accepted your request, let’s chat!",
      });

      fetchUser();
      navigate("/inbox", {
        state: {
          selectUserId: request.requester._id,
          userName: request.requester.name,
          requestId: request._id,
        },
      });
    } catch (err) {
      alert(
        err.response
          ? err.response.data.message
          : "An error occurred while accepting the request."
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-500 font-medium";
      case "Accepted":
        return "text-green-600 font-medium";
      case "Completed":
        return "text-blue-600 font-medium";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = (isAccepted) => {
    if (isAccepted === true) return "Accepted";
    if (isAccepted === false) return "Pending";
    return "Pending";
  };

  return (
    <>
      {user?.user?.request?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {user.user.request.map((req) => (
            <div
              key={req._id}
              className="border border-gray-200 rounded-xl p-5 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)] flex flex-col justify-between hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {req.task || "📝 No Task"}
                </h2>

                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-700">
                    💰 {req.offer || "₹0"}
                  </p>
                  <p className={getStatusColor(getStatusText(req.isAccepted))}>
                    📌 {getStatusText(req.isAccepted)}
                  </p>
                  <p className="text-gray-500">
                    🗓️{" "}
                    {req.createdAt
                      ? new Date(req.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-5">
                {req.isAccepted === false && (
                  <button
                    onClick={() => handleAccept(req)}
                    className="bg-emerald-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition"
                  >
                    ✅ Accept
                  </button>
                )}

                {req.isAccepted === true && (
                  <button
                    disabled
                    className="bg-gray-100 text-green-600 text-sm font-medium px-3 py-1.5 rounded-lg cursor-not-allowed"
                  >
                    ✅ Accepted
                  </button>
                )}

                {showDelete && (
                  <button
                    onClick={() => handleDelete(req._id)}
                    className="text-red-500 hover:text-red-600 hover:scale-110 transition"
                  >
                    <FaTrash className="text-lg" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-5">No requests found.</p>
      )}
    </>
  );
};

export default RequestCard;
