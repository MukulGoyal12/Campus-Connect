import ListingModel from "../models/listing-model.js";
import cloudinary from "../utils/cloudinary.js";
export const listItem = async (req, res) => {
  try {
    const { title, description, basePrice, category } = req.body;
    
    const image = req.file ? req.file.path : "default.png";
    
    if (!title || !description || !basePrice || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const response=await cloudinary.uploader.upload(image);
    if (!response || !response.secure_url) {
      return res.status(500).json({ message: "Image upload failed" });
    }
    const imageUrl = response.secure_url;
    
    const listing = await ListingModel.create({
      title,
      description,
      image: imageUrl,
      basePrice,
      category,
      seller: req.user._id,
    });

    
    return res.status(201).json({
      message: "Listing created successfully",
      listing,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const fetchListItems = async (req,res)=>{
    try{
        const listings = await ListingModel.find().populate("seller").sort({ createdAt: -1 });
        return res.status(200).json({ listings });  
    }catch(error){
        return res.status(500).json({ message: error.message });
    }
}

export const itemSold = async (req, res) => {
  try {
    const { itemId } = req.params;
    const listing = await ListingModel.findById(itemId).populate("seller");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot buy your own listing!" });
    }

    if (listing.sold) {
      return res.status(400).json({ message: "Item already marked as sold" });
    }

    listing.sold = true;
    await listing.save();

    return res.status(200).json({ message: "Item marked as sold successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
