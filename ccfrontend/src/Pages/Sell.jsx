import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

const Sell = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    basePrice: "",
    category: "",
    image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ added

  const toTitleCase = (str) =>
    str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else if (name === "title") {
      setFormData({ ...formData, title: toTitleCase(value) });
    } else if (name === "description") {
      setFormData({ ...formData, description: capitalizeFirst(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // ✅ start loader

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("basePrice", formData.basePrice);
    data.append("category", formData.category);
    data.append("image", formData.image);

    try {
      await axios.post(`${import.meta.env.VITE_API}/api/listings`, data, {
        withCredentials: true,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
      setFormData({
        title: "",
        description: "",
        basePrice: "",
        category: "",
        image: null,
      });
      toast.success("Item listed successfully!");
    } catch (err) {
      toast.error("Something went wrong while uploading.");
    } finally {
      setIsSubmitting(false); // ✅ reset loader
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 py-6 sm:py-10">
      <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 border border-gray-200">
        <h2 className="text-md sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          📤 List an Item for Sale
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📦 Item Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter a catchy title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
              placeholder="Describe your item clearly..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💰 Base Price (₹)
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🎯 Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Books">Books</option>
                <option value="Notes & Study Material">
                  Notes & Study Material
                </option>
                <option value="Room Essentials">Room Essentials</option>
                <option value="Electronics">Electronics</option>
                <option value="Sports Items">Sports Items</option>
                <option value="Event Tickets">Event Tickets</option>
                <option value="Clothes & Accessories">
                  Clothes & Accessories
                </option>
                <option value="Hostel Utilities">Hostel Utilities</option>
                <option value="Second Hand Mobiles">Second Hand Mobiles</option>
                <option value="Board Games / Cards">Board Games / Cards</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📷 Item Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              required
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0 file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-semibold py-3 rounded-lg shadow-md transition-all duration-300 ${
                isSubmitting
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
              }`}
            >
              {isSubmitting ? "⏳ Listing..." : "🚀 List Item for Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sell;
