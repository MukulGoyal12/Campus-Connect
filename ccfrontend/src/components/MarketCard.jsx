import { Link } from "react-router-dom";

function MarketCard({ listings }) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {listings.map((item) => (
            <div
              key={item._id}
              className="border rounded-2xl shadow-md bg-white flex flex-col h-full transition-all hover:scale-[1.015] hover:shadow-lg duration-300"
            >
              {/* Product Image */}
              <div className="relative bg-gray-100 h-64 flex items-center justify-center rounded-t-2xl overflow-hidden">
                <img
                  src={`http://localhost:3000/images/uploads/${item.image}`}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-grow justify-between">
                {/* Category badge */}
                <span className="inline-block w-fit mb-2 text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  🏷️ {item.category}
                </span>

                {/* Title */}
                <p className="text-sm font-semibold text-gray-800">
                  📦 Title: <span className="font-normal">{item.title}</span>
                </p>

                {/* Description */}
                <p className="text-sm font-semibold text-gray-800">
                  📄 Description:{" "}
                  <span className="font-normal text-gray-600">
                    {item.description}
                  </span>
                </p>

                {/* Base Price */}
                <p className="text-green-600 font-semibold text-[15px] mb-3">
                  💰 Base Price: ₹{item.basePrice}
                </p>

                {/* Seller Info */}
                <div className="flex items-center gap-4 mt-auto">
                  <Link to={`/user/${item.seller._id}`}>
                    <img
                      src={
                        item.seller.profilepic
                          ? `http://localhost:3000/images/uploads/${item.seller.profilepic}`
                          : `http://localhost:3000/images/default.png`
                      }
                      alt={item.seller.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500 hover:scale-105 transition duration-300"
                    />
                  </Link>
                  <div>
                    <p className="text-[14px] font-semibold text-gray-800">
                      👤 Seller:{" "}
                      <span className="font-normal">{item.seller.name}</span>
                    </p>
                    <p className="text-[13px] font-medium text-gray-700">
                      ✉️ Email:{" "}
                      <span className="font-normal">{item.seller.email}</span>
                    </p>
                    <p className="text-[13px] font-medium text-gray-600">
                      📅 Listed On:{" "}
                      <span className="font-normal">
                        {formatDate(item.createdAt)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Place Bid */}
              <div className="px-5 pb-5 pt-3">
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition duration-300 text-[14px]">
                  ⚡ Place a Bid
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
