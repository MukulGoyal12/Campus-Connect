import { format } from "date-fns";
import { Link } from "react-router-dom";

function HomeRequestCard({ requests }) {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        📌 Latest Requests
      </h1>

      {requests.length === 0 ? (
        <p className="text-gray-500">No requests available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white shadow-sm rounded-xl p-5 border border-gray-200 hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-1">
                  📖 {request.task}
                </h2>

                <p className="text-gray-600 font-medium">
                  💸 Offer:{" "}
                  <span className="text-green-600">{request.offer}</span>
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <Link
                  to={`/user/${request.requester._id}`}
                  className="flex items-center gap-3"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomeRequestCard;
