import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: "default.png"
    },
    basePrice: {
      type: Number,
      required: true
    },
    category: {
        type: String,
        enum: [
          "Books",
          "Notes & Study Material",
          "Room Essentials",
          "Electronics",
          "Sports Items",
          "Event Tickets",
          "Clothes & Accessories",
          "Hostel Utilities",
          "Second Hand Mobiles",
          "Board Games / Cards",
          "Others"
        ],
        required: true
      },      
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    bids: [
        {
          bidder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
          },
          amount: Number,
          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ],      
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
const ListingModel = mongoose.model("Listing", listingSchema);
export  default ListingModel;