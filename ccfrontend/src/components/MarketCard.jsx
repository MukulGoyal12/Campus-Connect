import { Link, useNavigate } from "react-router-dom";
import { useSocket } from "../provider/SocketProvider";
import { useEffect, useState } from "react";
import axios from "axios";

function MarketCard({ listings }) {
  const [currentUserId, setCurrentUserId] = useState("");
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get("http://localhost:3000/api/user", {
        withCredentials: true,
      });
      setCurrentUserId(res.data.user._id);
    };
    fetchUser();
  }, []);

  const handleClick = async (item) => {
    try {
      await axios.post(
        `http://localhost:3000/api/sold/${item._id}`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      if (err.response && err.response.data) {
        alert(
          err.response.data.message ||
            "An error occurred while processing the request."
        );
      } else {
        alert("Something went wrong. Please try again later.");
      }
      return;
    }

    if (!currentUserId) {
      alert("User not loaded yet!");
      return;
    }

    socket.emit("send_message", {
      senderId: currentUserId,
      receiverId: item.seller._id,
      message: `Hi! I want to buy your ${item.title}, let’s chat!`,
    });

    navigate("/inbox", {
      state: {
        selectUserId: item.seller._id,
        userName: item.seller.name,
        requestId: item._id,
      },
    });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getFullYear()}`;
  };

  return (
    <div>
      {listings.length === 0 ? (
        <p className="text-gray-500 mt-16 text-lg">
          📭 No listings available yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {[...listings]
            .sort((a, b) => {
              if (a.sold === b.sold) return 0;
              return a.sold ? 1 : -1;
            })
            .map((item) => (
              <div
                key={item._id}
                className="border rounded-2xl shadow-sm bg-white flex flex-col h-full transition-all hover:scale-[1.015] hover:shadow-lg duration-300"
              >
                <div className="relative bg-gray-100 h-48 sm:h-56 md:h-64 flex items-center justify-center rounded-t-2xl overflow-hidden">
                  <img
                    src={`http://localhost:3000/images/uploads/${item.image}`}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
                  <span className="inline-block w-fit mb-2 text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    🏷️ {item.category}
                  </span>

                  <p className="text-sm font-semibold text-gray-800">
                    📦 Title: <span className="font-normal">{item.title}</span>
                  </p>

                  <p className="text-sm font-semibold text-gray-800">
                    📄 Description:{" "}
                    <span className="font-normal text-gray-600">
                      {item.description}
                    </span>
                  </p>

                  <p className="text-green-600 font-semibold text-sm mb-3">
                    💰 Base Price: ₹{item.basePrice}
                  </p>

                  <div className="flex items-center gap-4 mt-auto">
                    <Link to={`/user/${item.seller._id}`}>
                      <img
                        src={
                          item.seller.profilepic
                            ? `http://localhost:3000/images/uploads/${item.seller.profilepic}`
                            : `http://localhost:3000/images/default.png`
                        }
                        alt={item.seller.name}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-purple-500 hover:scale-105 transition duration-300"
                      />
                    </Link>
                    <div>
                      <p className="text-[13px] sm:text-sm font-semibold text-gray-800">
                        👤 Seller:{" "}
                        <span className="font-normal">{item.seller.name}</span>
                      </p>
                      <p className="text-[12px] sm:text-[13px] font-medium text-gray-700">
                        ✉️ Email:{" "}
                        <span className="font-normal">{item.seller.email}</span>
                      </p>
                      <p className="text-[12px] sm:text-[13px] font-medium text-gray-600">
                        📅 Listed On:{" "}
                        <span className="font-normal">
                          {formatDate(item.createdAt)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 sm:px-5 pb-4 pt-2">
                  <button
                    onClick={() => handleClick(item)}
                    disabled={!currentUserId || item.sold}
                    className={`w-full text-sm sm:text-[15px] flex items-center justify-center gap-2 font-semibold py-2 rounded-full shadow-sm transition-all duration-300
            ${
              item.sold
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-lg"
            }
            ${!currentUserId ? "opacity-60 cursor-not-allowed" : ""}
          `}
                  >
                    ⚡ {item.sold ? "Sold" : "Buy Now"}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default MarketCard;
