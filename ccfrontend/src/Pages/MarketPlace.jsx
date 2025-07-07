import React, { useState } from "react";
import Buy from "./Buy";
import Sell from "./Sell";

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState("buy");

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 relative">
        <div className="flex space-x-6 border border-gray-200 rounded-full p-1 bg-gray-50 shadow-sm">
          <button
            onClick={() => setActiveTab("buy")}
            className={`px-8 py-2 rounded-full text-base font-medium transition-all duration-300 ${
              activeTab === "buy"
                ? "text-blue-600 bg-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Buy
          </button>

          <button
            onClick={() => setActiveTab("sell")}
            className={`px-8 py-2 rounded-full text-base font-medium transition-all duration-300 ${
              activeTab === "sell"
                ? "text-blue-600 bg-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      <div>
        {activeTab === "buy" && <Buy />}
        {activeTab === "sell" && <Sell />}
      </div>
    </div>
  );
};

export default Marketplace;
