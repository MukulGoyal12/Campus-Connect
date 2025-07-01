import { FaTrash } from "react-icons/fa";
import axios from "axios";

const RequestCard = ({ user, fetchUser }) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-500 font-semibold";
      case "Accepted":
        return "text-blue-500 font-semibold";
      case "Completed":
        return "text-green-600 font-semibold";
      default:
        return "text-gray-600";
    }
  };

  // isAccepted ko status string me convert karne wala function
  const getStatusText = (isAccepted) => {
    if (isAccepted === true) return "Accepted";
    if (isAccepted === false) return "Pending";
    return "Completed";
  };

  return (
    <>
      {user?.user?.request?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {user.user.request.map((req) => (
            <div
              key={req._id}
              className="border border-gray-200 bg-white/90 rounded-lg p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">{req.task}</h2>
                <div className="text-base text-gray-600 flex flex-wrap gap-3">
                  <span className="text-green-600 font-semibold">💰 {req.offer}</span>
                  <span className={getStatusColor(getStatusText(req.isAccepted))}>
                    📌 {getStatusText(req.isAccepted)}
                  </span>
                  <span className="text-gray-500">🗓️ {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-end mt-3">
                <button
                  onClick={() => handleDelete(req._id)}
                  className="text-red-500 hover:text-red-600 hover:scale-110 transition"
                >
                  <FaTrash className="text-xl" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center mt-4">No requests found.</p>
      )}
    </>
  );
};

export default RequestCard;
