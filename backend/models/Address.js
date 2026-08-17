const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER
    // =====================================================

    userId: {
      type: String,
      required: true,
      index: true,
    },

    // =====================================================
    // PERSONAL DETAILS
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    alternatePhone: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // ADDRESS DETAILS
    // =====================================================

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      required: true,
      trim: true,
    },

    house: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    landmark: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // ADDRESS TYPE
    // =====================================================

    addressType: {
      type: String,
      enum: ["Home", "Work"],
      default: "Home",
    },

    // =====================================================
    // GOOGLE MAP / LOCATION
    // =====================================================

    location: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },

      displayName: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // =====================================================
    // DEFAULT ADDRESS
    // =====================================================

    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
  },

  {
    timestamps: true,
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = mongoose.model("Address", addressSchema);