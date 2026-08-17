const express = require("express");
const Address = require("../models/Address");

const router = express.Router();

/*
=====================================================
SAVE ADDRESS
POST /api/address/save
=====================================================
*/
router.post("/save", async (req, res) => {
  try {
    console.log("SAVE ADDRESS BODY:", req.body);

    const {
      userId,
      name,
      mobile,
      pincode,
      area,
      house,
      city,
      district,
      state,
      landmark,
      alternatePhone,
      addressType,
      location,
    } = req.body;

    if (
      !userId ||
      !name ||
      !mobile ||
      !pincode ||
      !area ||
      !house ||
      !city ||
      !district ||
      !state
    ) {
      return res.status(400).json({
        success: false,
        message: "Required address fields are missing",
      });
    }

    // Check existing addresses
    const existingAddress = await Address.findOne({ userId });

    // Create new address
    const address = await Address.create({
      userId,
      name,
      mobile,
      pincode,
      area,
      house,
      city,
      district,
      state,
      landmark: landmark || "",
      alternatePhone: alternatePhone || "",
      addressType: addressType || "Home",

      location: location || {
        latitude: null,
        longitude: null,
        displayName: "",
      },

      // First address = default
      isDefault: !existingAddress,
    });

    console.log("ADDRESS SAVED:", address);

    return res.status(201).json({
      success: true,
      message: "Address saved successfully",
      address,
    });
  } catch (error) {
    console.error("SAVE ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save address",
      error: error.message,
    });
  }
});

/*
=====================================================
GET ALL USER ADDRESSES
GET /api/address/user/:userId
=====================================================
*/
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("GET ADDRESSES FOR USER:", userId);

    const addresses = await Address.find({
      userId,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("GET ADDRESSES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
      error: error.message,
    });
  }
});

/*
=====================================================
GET SINGLE ADDRESS
GET /api/address/:id
=====================================================
*/
router.get("/:id", async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("GET SINGLE ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch address",
      error: error.message,
    });
  }
});

/*
=====================================================
UPDATE ADDRESS
PUT /api/address/:id
=====================================================
*/
router.put("/:id", async (req, res) => {
  try {
    console.log("UPDATE ADDRESS:", req.params.id);
    console.log("UPDATE BODY:", req.body);

    const address = await Address.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("UPDATE ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update address",
      error: error.message,
    });
  }
});

/*
=====================================================
DELETE ADDRESS
DELETE /api/address/:id
=====================================================
*/
router.delete("/:id", async (req, res) => {
  try {
    console.log("DELETE ADDRESS:", req.params.id);

    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const userId = address.userId;

    await Address.findByIdAndDelete(req.params.id);

    /*
      Agar deleted address default tha,
      to latest address ko default bana do.
    */
    if (address.isDefault) {
      const nextAddress = await Address.findOne({
        userId,
      }).sort({
        createdAt: -1,
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
      error: error.message,
    });
  }
});

/*
=====================================================
SET DEFAULT ADDRESS
PUT /api/address/default/:id
=====================================================
*/
router.put("/default/:id", async (req, res) => {
  try {
    console.log("SET DEFAULT ADDRESS:", req.params.id);

    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    /*
      Remove default from user's all addresses
    */
    await Address.updateMany(
      {
        userId: address.userId,
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );

    /*
      Set selected address as default
    */
    address.isDefault = true;

    await address.save();

    return res.status(200).json({
      success: true,
      message: "Default address changed",
      address,
    });
  } catch (error) {
    console.error("DEFAULT ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change default address",
      error: error.message,
    });
  }
});

module.exports = router;