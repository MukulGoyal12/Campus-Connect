import axios from "axios";
import { useState } from "react";

const AddRequest = ({ onClose, onRequestAdded }) => {
  const [RequestData, setRequestData] = useState({
    task: "",
    offer: "",
  });

  const handleChange = (e) => {
    setRequestData({ ...RequestData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/api/request", RequestData, {
        withCredentials: true,
      })
      .then((res) => {
        // console.log("Request added:", res.data);
        onRequestAdded();
        onClose();
      })
      .catch((err) => {
        console.error("Request error:", err);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 w-full max-w-sm space-y-6 relative border border-gray-300">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
          📋 Add New Request
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Task"
            name="task"
            value={RequestData.task}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 outline-none"
            required
          />

          <input
            type="text"
            placeholder="Offer (₹)"
            name="offer"
            value={RequestData.offer}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 outline-none"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white font-bold rounded-lg hover:from-fuchsia-700 hover:to-pink-600 transition duration-300"
          >
            📤 Post Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRequest;
