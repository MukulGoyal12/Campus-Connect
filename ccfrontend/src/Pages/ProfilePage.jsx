import ProfileCard from "../components/ProfileCard";
import RequestCard from "../components/RequestCard";
import FulfilledRequests from "../components/FulfilledRequests";

export default function ProfilePage({
  user,
  fetchUser,
  showAddRequest,
  onAddRequestClick,
  showDelete,
  showChangePhoto
}) {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      <ProfileCard
        user={user}
        fetchUser={fetchUser}
        showChangePhoto={showChangePhoto}
      />

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Requests</h2>
        <RequestCard
          user={user}
          fetchUser={fetchUser}
          showDelete={showDelete}
        />
      </div>

      {showAddRequest && (
        <div className="flex justify-center">
          <button
            onClick={onAddRequestClick}
            className="px-5 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Add New Request
          </button>
        </div>
      )}

      {/* <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Fulfilled Requests</h2>
        <FulfilledRequests user={user} />
      </div> */}

    </div>
  );
}
