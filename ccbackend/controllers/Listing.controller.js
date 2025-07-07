import ListingModel from "../models/listing-model.js";

export const listItem = async (req, res) => {
  try {
    const { title, description, basePrice, category } = req.body;
    const image = req.file ? req.file.filename : "default.png";

    const listing = await ListingModel.create({
      title,
      description,
      image,
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