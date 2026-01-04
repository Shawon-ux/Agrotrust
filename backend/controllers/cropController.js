// backend/controllers/cropController.js
const Crop = require("../models/Crop");
const CropRequest = require("../models/CropRequest");
const Notification = require("../models/Notification");
const User = require("../models/User");

// GET /api/crops  (public for logged-in users)
exports.getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find().sort({ createdAt: -1 });
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load crops" });
  }
};

// POST /api/crops   (ADMIN can add new crop)
exports.createCrop = async (req, res) => {
  try {
    const {
      cropName,
      name,
      variety,
      location,
      pricePerUnit,
      pricePerKg,
      quantityAvailable,
      quantityKg,
      unit,
      status,
    } = req.body;

    const finalName = (cropName || name || "").trim();
    const finalPrice = Number(pricePerUnit ?? pricePerKg ?? 0);
    const finalQty = Number(quantityAvailable ?? quantityKg ?? 0);

    if (!finalName) return res.status(400).json({ message: "cropName is required" });
    if (!finalPrice) return res.status(400).json({ message: "pricePerUnit is required" });

    let imageUrl = "";
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;

    const crop = await Crop.create({
      cropName: finalName,
      variety: variety || "",
      location: location || "",
      pricePerUnit: finalPrice,
      quantityAvailable: finalQty,
      unit: unit || "kg",
      status: status || (finalQty > 0 ? "AVAILABLE" : "SOLD_OUT"),
      imageUrl,
      farmer: req.user._id,
    });

    res.status(201).json(crop);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create crop" });
  }
};

// POST /api/crops/request (FARMER requests to add crop)
exports.requestCropAddition = async (req, res) => {
  try {
    const {
      cropName,
      variety,
      location,
      pricePerUnit,
      quantityAvailable,
      unit,
      description,
    } = req.body;

    if (!cropName || !pricePerUnit || !quantityAvailable) {
      return res.status(400).json({ 
        message: "cropName, pricePerUnit, and quantityAvailable are required" 
      });
    }

    let imageUrl = "";
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;

    const cropRequest = await CropRequest.create({
      farmer: req.user._id,
      cropName,
      variety: variety || "",
      location: location || "",
      pricePerUnit: Number(pricePerUnit),
      quantityAvailable: Number(quantityAvailable),
      unit: unit || "kg",
      description: description || "",
      imageUrl,
      status: "PENDING",
    });

    // Get farmer details for notification
    const farmer = await User.findById(req.user._id);
    
    // Create detailed notification message
    const notificationMessage = `
      New crop request from ${farmer.name} (${farmer.email})
      
      📋 **Crop Details:**
      - Crop: ${cropName}
      - Variety: ${variety || "Not specified"}
      - Location: ${location || "Not specified"}
      - Price: ৳${pricePerUnit} per ${unit || "kg"}
      - Quantity: ${quantityAvailable} ${unit || "kg"}
      ${description ? `- Description: ${description}` : ''}
      
      📅 Requested: ${new Date().toLocaleString()}
    `;

    // Create notifications for all admins
    const admins = await User.find({ role: "ADMIN" });
    
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: `New Crop Request: ${cropName}`,
        message: notificationMessage,
        type: "CROP_REQUEST",
        link: `/crops/requests`,
        metadata: {
          cropRequestId: cropRequest._id,
          farmerId: farmer._id,
          farmerName: farmer.name,
          farmerEmail: farmer.email,
          cropName: cropName,
          variety: variety,
          location: location,
          pricePerUnit: pricePerUnit,
          quantityAvailable: quantityAvailable,
          unit: unit,
          description: description,
          imageUrl: imageUrl,
          timestamp: new Date()
        }
      });
    }

    // Also create a notification for the farmer
    await Notification.create({
      user: farmer._id,
      title: "Crop Request Submitted",
      message: `Your crop "${cropName}" request has been submitted for admin approval.`,
      type: "INFO",
      link: `/crops/request/status`
    });

    res.status(201).json({
      success: true,
      message: "Crop request submitted. Waiting for admin approval.",
      data: cropRequest
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to submit crop request" });
  }
};

// GET /api/crops/requests (ADMIN view crop requests)
exports.getCropRequests = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const requests = await CropRequest.find()
      .populate("farmer", "name email phone")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load crop requests" });
  }
};

// PATCH /api/crops/requests/:id (ADMIN approve/reject crop request)
exports.approveCropRequest = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use APPROVED or REJECTED" });
    }

    const cropRequest = await CropRequest.findById(id)
      .populate("farmer", "name email");

    if (!cropRequest) {
      return res.status(404).json({ message: "Crop request not found" });
    }

    const admin = await User.findById(req.user._id);

    if (status === "APPROVED") {
      // Create actual crop from request
      const crop = await Crop.create({
        farmer: cropRequest.farmer,
        cropName: cropRequest.cropName,
        variety: cropRequest.variety,
        location: cropRequest.location,
        pricePerUnit: cropRequest.pricePerUnit,
        quantityAvailable: cropRequest.quantityAvailable,
        unit: cropRequest.unit,
        imageUrl: cropRequest.imageUrl,
        status: "AVAILABLE",
      });

      // Create detailed approval notification for farmer
      const approvalMessage = `
        ✅ **Your crop has been approved!**
        
        🎉 Congratulations! Your crop "${cropRequest.cropName}" has been approved by Admin ${admin.name}.
        
        📋 **Approved Details:**
        - Crop: ${cropRequest.cropName}
        - Variety: ${cropRequest.variety || "Not specified"}
        - Location: ${cropRequest.location || "Not specified"}
        - Price: ৳${cropRequest.pricePerUnit} per ${cropRequest.unit}
        - Quantity: ${cropRequest.quantityAvailable} ${cropRequest.unit}
        ${cropRequest.description ? `- Description: ${cropRequest.description}` : ''}
        
        🛒 **Your crop is now live on the marketplace!**
        Buyers can now view and purchase your crop.
        
        📅 Approved: ${new Date().toLocaleString()}
        ${adminNotes ? `\n📝 **Admin Note:** ${adminNotes}` : ''}
      `;

      await Notification.create({
        user: cropRequest.farmer._id,
        title: `Crop Approved: ${cropRequest.cropName}`,
        message: approvalMessage,
        type: "SUCCESS",
        link: `/crops`,
        metadata: {
          cropId: crop._id,
          status: "APPROVED",
          adminName: admin.name,
          adminNotes: adminNotes,
          timestamp: new Date()
        }
      });

    } else {
      // Create detailed rejection notification for farmer
      const rejectionMessage = `
        ❌ **Crop Request Rejected**
        
        Your crop "${cropRequest.cropName}" request has been reviewed and rejected by Admin ${admin.name}.
        
        📋 **Request Details:**
        - Crop: ${cropRequest.cropName}
        - Variety: ${cropRequest.variety || "Not specified"}
        - Location: ${cropRequest.location || "Not specified"}
        - Price: ৳${cropRequest.pricePerUnit} per ${cropRequest.unit}
        - Quantity: ${cropRequest.quantityAvailable} ${cropRequest.unit}
        
        📅 Reviewed: ${new Date().toLocaleString()}
        ${adminNotes ? `\n📝 **Reason for Rejection:** ${adminNotes}` : 'No specific reason provided.'}
        
        💡 **Suggestions:**
        - Check if all information is accurate
        - Ensure price is competitive
        - Provide better quality images
        - Add more detailed description
        
        You can submit a new request with corrections.
      `;

      await Notification.create({
        user: cropRequest.farmer._id,
        title: `Crop Rejected: ${cropRequest.cropName}`,
        message: rejectionMessage,
        type: "WARNING",
        link: `/crops/request`,
        metadata: {
          status: "REJECTED",
          adminName: admin.name,
          adminNotes: adminNotes,
          timestamp: new Date()
        }
      });
    }

    // Update crop request status
    cropRequest.status = status;
    if (adminNotes) cropRequest.adminNotes = adminNotes;
    cropRequest.reviewedBy = req.user._id;
    await cropRequest.save();

    res.json({
      success: true,
      message: `Crop request ${status.toLowerCase()}`,
      data: cropRequest
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to process crop request" });
  }
};

// PATCH /api/crops/:id/availability  (ADMIN only)
exports.setCropAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    const crop = await Crop.findById(id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    crop.status = available ? "AVAILABLE" : "SOLD_OUT";
    await crop.save();

    res.json({ message: "Availability updated", crop });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update availability" });
  }
};

// GET /api/crops/my-crops (Farmer's crops)
exports.getMyCrops = async (req, res) => {
  try {
    if (req.user.role !== "FARMER") {
      return res.status(403).json({ message: "Farmer only" });
    }

    const crops = await Crop.find({ farmer: req.user._id })
      .sort({ createdAt: -1 });

    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load crops" });
  }
};

// GET /api/crops/my-requests (Farmer's crop requests)
exports.getMyCropRequests = async (req, res) => {
  try {
    if (req.user.role !== "FARMER") {
      return res.status(403).json({ message: "Farmer only" });
    }

    const requests = await CropRequest.find({ farmer: req.user._id })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load crop requests" });
  }
};