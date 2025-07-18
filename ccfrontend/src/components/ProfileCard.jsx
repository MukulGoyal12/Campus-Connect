import axios from "axios";
import { useState, useRef } from "react";
import { FiCamera, FiX, FiMessageSquare } from "react-icons/fi";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const ProfileCard = ({ user, fetchUser, showChangePhoto }) => {
  const fileInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      if (!selectedFile) {
        alert("Please select an image file.");
        return;
      }
      await axios
      .post(`${import.meta.env.VITE_API}/api/upload`, formData,{
        withCredentials:true,
        headers: {
          Authorization: "Bearer " + document.cookie.substring(6),
          "Content-Type": "multipart/form-data",

        },

      })
      fetchUser();
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleImageClick = () => setShowModal(true);
  const handleChangePhotoClick = () => fileInputRef.current.click();

  return (
    <>
      <div className="bg-white shadow-lg rounded-xl p-5 mb-6 border border-gray-200 max-w-md mx-auto space-y-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={`${import.meta.env.VITE_API}/images/uploads/${user?.user?.profilepic}`}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover cursor-pointer ring-2 ring-gray-300 hover:ring-purple-500 hover:scale-105 transition duration-300"
              onClick={handleImageClick}
            />
            {showChangePhoto && (
              <button
                onClick={handleChangePhotoClick}
                className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-1.5 rounded-full border-2 border-white shadow hover:bg-purple-700 transition"
              >
                <FiCamera size={14} />
              </button>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-800 mt-2">{user?.user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.user?.email}</p>

          {showChangePhoto && (
            <button
              onClick={handleChangePhotoClick}
              className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium mt-1 transition"
            >
              <FiCamera size={16} />
              <span>Change Photo</span>
            </button>
          )}

          {/* ✅ Message button */}
          {!showChangePhoto && user?.user?._id && (
            <Link
              to={`/inbox?to=${user.user._id}`}
              className="mt-3 inline-flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
            >
              <FiMessageSquare size={16} />
              Message
            </Link>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-700 mt-2">
          <p>🎓 <span className="font-medium">Year:</span> {user?.user?.year}</p>
          <p>🏠 <span className="font-medium">Hostel Type:</span> {user?.user?.hosteller ? "Hosteller" : "Day Scholar"}</p>
          <p>📅 <span className="font-medium">Joined On:</span> {user?.user?.createdAt ? format(new Date(user.user.createdAt), 'dd MMM yyyy') : "N/A"}</p>
        </div>
      </div>

      <input
        type="file"
        name="image"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={`${import.meta.env.VITE_API}/images/uploads/${user?.user?.profilepic}`}
              alt="Full Profile"
              className="w-72 h-72 md:w-80 md:h-80 rounded-full object-cover border-4 border-white shadow-2xl transition"
            />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-white text-2xl hover:text-gray-300"
            >
              <FiX />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileCard;
