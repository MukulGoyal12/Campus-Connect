import { FaCheckCircle } from "react-icons/fa";

const FulfilledRequests = ({ user }) => {
  return (
    <>
      {user?.user?.fulfilledRequests?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {user.user.fulfilledRequests.map((req) => (
            <div
              key={req._id}
              className="border border-green-200 bg-green-50 rounded-lg p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-green-800">{req.task}</h2>
                <div className="text-base text-green-600 flex flex-wrap gap-3">
                  <span>💰 {req.offer}</span>
                  <span>🗓️ {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 text-green-700 font-medium">
                <FaCheckCircle className="text-xl" />
                Fulfilled
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No fulfilled requests yet.</p>
      )}
    </>
  );
};

export default FulfilledRequests;
