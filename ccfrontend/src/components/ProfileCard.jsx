import axios from "axios";
import { useState, useRef } from "react";
import { FiCamera, FiX } from "react-icons/fi";

const ProfileCard = ({ user, fetchUser }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      await axios.post("http://localhost:3000/api/upload", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchUser();
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleImageClick = () => {
    setShowModal(true);
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6 flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <img
            src={`http://localhost:3000/images/uploads/${user?.user?.profilepic}`}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover cursor-pointer ring-2 ring-gray-300 hover:ring-blue-500 hover:opacity-90 transition"
            onClick={handleImageClick}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">{user?.user?.name}</h2>
          <p className="text-gray-500">{user?.user?.email}</p>
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm text-gray-600">
            <span>🎓 Year: {user?.user?.year}</span>
            <span>🏠 {user?.user?.hosteller ? "Hosteller" : "Day Scholar"}</span>
          </div>
        </div>

        <div>
          <button
            onClick={handleChangePhotoClick}
            className="flex items-center space-x-1 text-blue-600 font-medium hover:underline"
          >
            <FiCamera className="text-xl" />
            <span>Change Photo</span>
          </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={`http://localhost:3000/images/uploads/${user?.user?.profilepic}`}
              alt="Full Profile"
              className="w-72 h-72 md:w-96 md:h-96 rounded-full object-cover border-4 border-white shadow-xl transition"
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
