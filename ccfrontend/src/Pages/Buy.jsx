import axios from "axios";
import React, { useEffect, useState } from "react";
import MarketCard from "../components/MarketCard";

const Buy = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchListings = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API}/api/allListings`, {
      withCredentials: true,
      headers: {
        Authorization: "Bearer " +localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
    });
    setListings(res.data.listings);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredListings = listings.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
          🛒 Market Buzz
        </h2>

        <input
          type="text"
          placeholder="🔍 Search listings..."
          className="w-full sm:w-72 border-2 border-gray-400 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white placeholder-gray-600 font-medium"
          onChange={handleChange}
          value={searchTerm}
        />
      </div>

      <MarketCard listings={filteredListings} />
    </div>
  );
};

export default Buy;
