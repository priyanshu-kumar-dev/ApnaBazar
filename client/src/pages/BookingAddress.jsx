import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FiCrosshair,
  FiSearch,
  FiMapPin,
  FiCheck,
  FiX,
  FiNavigation,
} from "react-icons/fi";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./BookingAddress.css";

// =====================================================
// LEAFLET MARKER FIX
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// =====================================================
// DEFAULT INDIA LOCATION
// =====================================================

const defaultPosition = [25.5941, 85.1376];

// =====================================================
// INDIAN STATES
// =====================================================

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// =====================================================
// BIHAR DISTRICTS
// =====================================================

const biharDistricts = [
  "Araria",
  "Arwal",
  "Aurangabad",
  "Banka",
  "Begusarai",
  "Bhagalpur",
  "Bhojpur",
  "Buxar",
  "Darbhanga",
  "East Champaran",
  "Gaya",
  "Gopalganj",
  "Jamui",
  "Jehanabad",
  "Kaimur",
  "Katihar",
  "Khagaria",
  "Kishanganj",
  "Lakhisarai",
  "Madhepura",
  "Madhubani",
  "Munger",
  "Muzaffarpur",
  "Nalanda",
  "Nawada",
  "Patna",
  "Purnia",
  "Rohtas",
  "Saharsa",
  "Samastipur",
  "Saran",
  "Sheikhpura",
  "Sheohar",
  "Sitamarhi",
  "Siwan",
  "Supaul",
  "Vaishali",
  "West Champaran",
];

// =====================================================
// MOBILE NUMBER VALIDATION
// =====================================================

const isValidIndianMobile = (mobile) => {
  const number = String(mobile || "").trim();

  // Exactly 10 digits and starts with 6, 7, 8 or 9
  if (!/^[6-9]\d{9}$/.test(number)) {
    return false;
  }

  // Reject same digit repeated
  if (/^(\d)\1{9}$/.test(number)) {
    return false;
  }

  // Reject common fake/test numbers
  const fakeNumbers = [
    "1234567890",
    "0123456789",
    "9876543210",
    "0987654321",
    "1111111111",
    "2222222222",
    "3333333333",
    "4444444444",
    "5555555555",
    "6666666666",
    "7777777777",
    "8888888888",
    "9999999999",
  ];

  if (fakeNumbers.includes(number)) {
    return false;
  }

  return true;
};

// =====================================================
// INDIA POST PINCODE VERIFICATION
// =====================================================

const verifyPincode = async (pincode) => {
  const pin = String(pincode || "").trim();

  if (!/^\d{6}$/.test(pin)) {
    return {
      valid: false,
      message: "Pincode exactly 6 digits ka hona chahiye.",
    };
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);

    if (!response.ok) {
      return {
        valid: false,
        message: "Pincode verify nahi ho saka.",
      };
    }

    const data = await response.json();

    const result = data?.[0];

    if (
      !result ||
      result.Status !== "Success" ||
      !Array.isArray(result.PostOffice) ||
      result.PostOffice.length === 0
    ) {
      return {
        valid: false,
        message: `Pincode ${pin} India Post records me nahi mila.`,
      };
    }

    return {
      valid: true,
      pincode: pin,
      postOffice: result.PostOffice[0],
      postOffices: result.PostOffice,
    };
  } catch (error) {
    console.error("Pincode verification error:", error);

    return {
      valid: false,
      message: "Pincode verification service unavailable.",
    };
  }
};

// =====================================================
// MAP CONTROLLER
// =====================================================

const MapController = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.flyTo(position, 17, {
      animate: true,
      duration: 0.8,
    });
  }, [position, map]);

  return null;
};

// =====================================================
// MAP CLICK HANDLER
// =====================================================

const MapClickHandler = ({ onLocationChange }) => {
  useMapEvents({
    click(e) {
      onLocationChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
};

// =====================================================
// DRAGGABLE MARKER
// =====================================================

const LocationMarker = ({ position, onLocationChange }) => {
  if (!position) return null;

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: async (event) => {
          const marker = event.target;
          const location = marker.getLatLng();

          await onLocationChange([location.lat, location.lng]);
        },
      }}
    />
  );
};

// =====================================================
// CONVERT LOCATION TO ADDRESS
// =====================================================

const convertLocationToAddress = (data) => {
  const a = data?.address || {};

  const pincode = a.postcode || "";

  const area =
    a.suburb || a.neighbourhood || a.hamlet || a.village || a.locality || "";

  const district =
    a.state_district || a.district || a.county || a.city_district || "";

  const city =
    a.city || a.town || a.municipality || a.village || a.city_district || "";

  const state = a.state || "";

  const houseParts = [a.house_number, a.road, a.street, a.neighbourhood].filter(
    Boolean,
  );

  const house = houseParts.join(", ");

  return {
    pincode,
    area,
    house,
    city,
    district,
    state,
  };
};

// =====================================================
// BOOKING ADDRESS
// =====================================================

const BookingAddress = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { service, desc, price } = location.state || {};

  // ===================================================
  // STATES
  // ===================================================

  const [addressType, setAddressType] = useState("Home");

  const [locationLoading, setLocationLoading] = useState(false);

  const [searchLoading, setSearchLoading] = useState(false);

  const [savingAddress, setSavingAddress] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [searchResults, setSearchResults] = useState([]);

  const [showMap, setShowMap] = useState(false);

  const [mapPosition, setMapPosition] = useState(null);

  const [mapAddress, setMapAddress] = useState(null);

  const [locationSaved, setLocationSaved] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(null);

  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  const [address, setAddress] = useState({
    name: "",
    mobile: "",
    pincode: "",
    area: "",
    house: "",
    city: "",
    district: "",
    state: "",
    landmark: "",
    alternatePhone: "",
  });

  // ===================================================
  // RESTORE SAVED ADDRESS
  // ===================================================

  useEffect(() => {
    const savedAddress = localStorage.getItem("bookingAddress");

    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress);

        setAddress((prev) => ({
          ...prev,
          ...parsed,
        }));

        if (parsed.addressType) {
          setAddressType(parsed.addressType);
        }

        if (parsed.location) {
          setSelectedLocation({
            latitude: parsed.location.latitude,
            longitude: parsed.location.longitude,
            accuracy: parsed.location.accuracy || null,
            displayName: parsed.location.displayName || "",
            address: parsed.location.address || {},
          });

          setMapPosition([parsed.location.latitude, parsed.location.longitude]);

          setGpsAccuracy(parsed.location.accuracy || null);

          setMapAddress({
            displayName: parsed.location.displayName || "",
            pincode: parsed.pincode || "",
            area: parsed.area || "",
            house: parsed.house || "",
            city: parsed.city || "",
            district: parsed.district || "",
            state: parsed.state || "",
          });

          setLocationSaved(true);
        }
      } catch (error) {
        console.error("Booking address restore error:", error);
      }
    }

    // =================================================
    // RESTORE OLD SAVED LOCATION
    // =================================================

    const savedLocation = localStorage.getItem("savedLocation");

    if (!savedLocation) return;

    try {
      const parsed = JSON.parse(savedLocation);

      if (
        typeof parsed.latitude === "number" &&
        typeof parsed.longitude === "number"
      ) {
        setSelectedLocation(parsed);

        setMapPosition([parsed.latitude, parsed.longitude]);

        setMapAddress({
          ...(parsed.address || {}),
          displayName: parsed.displayName || "",
        });

        setGpsAccuracy(parsed.accuracy || null);

        setLocationSaved(true);

        if (parsed.address) {
          setAddress((prev) => ({
            ...prev,
            ...parsed.address,
          }));
        }
      }
    } catch (error) {
      console.error("Saved location error:", error);
    }
  }, []);

  // ===================================================
  // INPUT CHANGE
  // ===================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ===============================================
    // MOBILE NUMBERS
    // ===============================================

    if (name === "mobile" || name === "alternatePhone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

      setAddress((prev) => ({
        ...prev,
        [name]: digitsOnly,
      }));

      setLocationSaved(false);

      return;
    }

    // ===============================================
    // PINCODE
    // ===============================================

    if (name === "pincode") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 6);

      setAddress((prev) => ({
        ...prev,
        pincode: digitsOnly,
      }));

      setLocationSaved(false);

      return;
    }

    // ===============================================
    // NORMAL INPUT
    // ===============================================

    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));

    setLocationSaved(false);
  };

  // ===================================================
  // REVERSE GEOCODING
  // ===================================================

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18&accept-language=en`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Reverse geocoding failed");
      }

      const data = await response.json();

      const converted = convertLocationToAddress(data);

      return {
        ...converted,
        displayName: data.display_name || "",
      };
    } catch (error) {
      console.error("Reverse geocode error:", error);

      return null;
    }
  };

  // ===================================================
  // FILL ADDRESS
  // ===================================================

  const fillAddress = (result) => {
    if (!result) return;

    setAddress((prev) => ({
      ...prev,

      pincode: result.pincode || prev.pincode,

      area: result.area || prev.area,

      house: result.house || prev.house,

      city: result.city || prev.city,

      district: result.district || prev.district,

      state: result.state || prev.state,
    }));
  };

  // ===================================================
  // APPLY MAP LOCATION
  // ===================================================

  const applyMapLocation = async (position, accuracy = null) => {
    setMapPosition(position);

    setLocationLoading(true);

    if (accuracy !== null) {
      setGpsAccuracy(accuracy);
    }

    const result = await reverseGeocode(position[0], position[1]);

    if (result) {
      setMapAddress(result);

      const locationObject = {
        latitude: position[0],
        longitude: position[1],
        accuracy,
        displayName: result.displayName || "",
        address: result,
      };

      setSelectedLocation(locationObject);

      fillAddress(result);
    } else {
      const fallbackAddress = {
        displayName: "Selected location",
        pincode: "",
        area: "",
        house: "",
        city: "",
        district: "",
        state: "",
      };

      setMapAddress(fallbackAddress);

      setSelectedLocation({
        latitude: position[0],
        longitude: position[1],
        accuracy,
        displayName: "Selected location",
        address: {},
      });
    }

    setLocationLoading(false);
  };

  // ===================================================
  // CURRENT LOCATION
  // ===================================================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support location.");

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        console.log("REAL GPS:", latitude, longitude);

        console.log("GPS ACCURACY:", accuracy);

        await applyMapLocation([latitude, longitude], accuracy);
      },

      (error) => {
        console.error("GPS ERROR:", error);

        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          alert(
            "Location permission denied.\n\nChrome → 🔒 → Location → Allow → Reload page.",
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert(
            "Location unavailable.\n\nWindows Location ON karein ya mobile GPS se try karein.",
          );
        } else if (error.code === error.TIMEOUT) {
          alert(
            "Location detect hone me time lag raha hai. Dobara try karein.",
          );
        } else {
          alert("Current location detect nahi ho saki.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: 0,
      },
    );
  };

  // ===================================================
  // CURRENT LOCATION BUTTON
  // ===================================================

  const handleCurrentLocation = () => {
    setShowMap(true);

    getCurrentLocation();
  };

  // ===================================================
  // OPEN MAP
  // ===================================================

  const openMap = () => {
    setShowMap(true);

    if (!mapPosition) {
      getCurrentLocation();
    }
  };

  // ===================================================
  // SEARCH NOMINATIM
  // ===================================================

  const searchNominatim = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&countrycodes=in&q=${encodeURIComponent(
          query,
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error("Nominatim search:", error);

      return [];
    }
  };

  // ===================================================
  // SEARCH PHOTON
  // ===================================================

  const searchPhoton = async (query) => {
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      return (data.features || []).map((item, index) => {
        const [longitude, latitude] = item.geometry?.coordinates || [];

        const props = item.properties || {};

        const displayName = [
          props.name,
          props.locality,
          props.district,
          props.state,
          props.postcode,
          props.country,
        ]
          .filter(Boolean)
          .join(", ");

        return {
          place_id: `photon-${index}-${latitude}-${longitude}`,

          lat: latitude,

          lon: longitude,

          display_name: displayName,

          address: {
            postcode: props.postcode,

            suburb: props.locality,

            village: props.locality,

            town: props.city,

            city: props.city,

            state: props.state,

            country: props.country,
          },
        };
      });
    } catch (error) {
      console.error("Photon search:", error);

      return [];
    }
  };

  // ===================================================
  // SEARCH LOCATION
  // ===================================================

  const searchLocation = async () => {
    const query = searchText.trim();

    if (!query) {
      alert("Area, village, city ya pincode enter karein.");

      return;
    }

    setSearchLoading(true);
    setSearchResults([]);

    try {
      const queries = [query, `${query}, India`, `${query}, Bihar, India`];

      let results = [];

      // ===============================================
      // NOMINATIM SEARCH
      // ===============================================

      for (const searchQuery of queries) {
        const data = await searchNominatim(searchQuery);

        if (data.length) {
          results = [...results, ...data];
        }

        if (results.length >= 10) {
          break;
        }
      }

      // ===============================================
      // REMOVE DUPLICATES
      // ===============================================

      const uniqueResults = [];
      const seen = new Set();

      results.forEach((item) => {
        const key = `${item.lat}-${item.lon}`;

        if (!seen.has(key)) {
          seen.add(key);
          uniqueResults.push(item);
        }
      });

      // ===============================================
      // PHOTON FALLBACK
      // ===============================================

      if (uniqueResults.length === 0) {
        const photonResults = await searchPhoton(`${query}, Bihar, India`);

        uniqueResults.push(...photonResults);
      }

      setSearchResults(uniqueResults.slice(0, 10));

      if (uniqueResults.length === 0) {
        alert(
          `Location nahi mili.

Try:

843302

Sitamarhi Bihar

Sirauli Ramnagra

Ramnagra Sitamarhi

Sirauli, Sitamarhi, Bihar`,
        );
      }
    } catch (error) {
      console.error("Location search error:", error);

      alert("Location search failed. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  // ===================================================
  // SELECT SEARCH LOCATION
  // ===================================================

  const selectSearchLocation = async (result) => {
    const latitude = Number(result.lat);

    const longitude = Number(result.lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return;
    }

    const converted = convertLocationToAddress(result);

    const locationObject = {
      latitude,
      longitude,

      displayName: result.display_name || "",

      address: converted,
    };

    setMapPosition([latitude, longitude]);

    setMapAddress({
      ...converted,

      displayName: result.display_name || "",
    });

    setSelectedLocation(locationObject);

    fillAddress(converted);

    setSearchResults([]);

    setSearchText(result.display_name || "");

    setLocationSaved(false);

    setShowMap(true);
  };

  // ===================================================
  // MAP POSITION CHANGE
  // ===================================================

  const handleMapPositionChange = async (position) => {
    await applyMapLocation(position);
  };

  // ===================================================
  // SAVE MAP LOCATION
  // ===================================================

  const saveMapLocation = () => {
    if (!mapPosition) {
      alert("Please select a location first.");

      return;
    }

    if (!mapAddress) {
      alert("Address load hone ka wait karein.");

      return;
    }

    // ===============================================
    // REQUIRE REAL ADDRESS DATA
    // ===============================================

    if (!mapAddress.pincode || !mapAddress.state || !mapAddress.district) {
      alert(
        "Selected location ka complete address nahi mila. Please map par valid location select karein.",
      );

      return;
    }

    const locationObject = {
      latitude: mapPosition[0],

      longitude: mapPosition[1],

      accuracy: gpsAccuracy,

      displayName: mapAddress.displayName || "",

      address: {
        pincode: mapAddress.pincode || "",

        area: mapAddress.area || "",

        house: mapAddress.house || "",

        city: mapAddress.city || "",

        district: mapAddress.district || "",

        state: mapAddress.state || "",
      },

      savedAt: new Date().toISOString(),
    };

    // ===============================================
    // FILL FORM
    // ===============================================

    setAddress((prev) => ({
      ...prev,

      pincode: mapAddress.pincode || prev.pincode,

      area: mapAddress.area || prev.area,

      house: mapAddress.house || prev.house,

      city: mapAddress.city || prev.city,

      district: mapAddress.district || prev.district,

      state: mapAddress.state || prev.state,
    }));

    // ===============================================
    // LOCAL STORAGE
    // ===============================================

    localStorage.setItem("savedLocation", JSON.stringify(locationObject));

    setSelectedLocation(locationObject);

    setLocationSaved(true);

    setShowMap(false);

    alert(
      `Location saved successfully!

${
  mapAddress.displayName ||
  `${mapAddress.area || ""}, ${mapAddress.district || ""}, ${
    mapAddress.state || ""
  } - ${mapAddress.pincode || ""}`
}`,
    );
  };

  // ===================================================
  // REMOVE LOCATION
  // ===================================================

  const removeSavedLocation = () => {
    localStorage.removeItem("savedLocation");

    setLocationSaved(false);

    setSelectedLocation(null);

    setMapPosition(null);

    setMapAddress(null);

    setGpsAccuracy(null);

    setAddress((prev) => ({
      ...prev,

      pincode: "",
      area: "",
      house: "",
      city: "",
      district: "",
      state: "",
    }));
  };

  // ===================================================
  // GET USER ID
  // ===================================================

  const getUserId = () => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      return null;
    }

    try {
      const user = JSON.parse(userData);

      return user?._id || user?.id || user?.userId || null;
    } catch (error) {
      console.error("User JSON parse error:", error);

      return null;
    }
  };

  // ===================================================
  // SAVE ADDRESS TO MONGODB
  // ===================================================

  const saveAddress = async () => {
    // ===============================================
    // REQUIRED FIELDS
    // ===============================================

    if (
      !address.name?.trim() ||
      !address.mobile?.trim() ||
      !address.pincode?.trim() ||
      !address.area?.trim() ||
      !address.house?.trim() ||
      !address.city?.trim() ||
      !address.district?.trim() ||
      !address.state?.trim()
    ) {
      alert("Please fill complete address details.");

      return;
    }

    // ===============================================
    // MOBILE VALIDATION
    // ===============================================

    if (!isValidIndianMobile(address.mobile)) {
      alert(
        "Please enter a valid Indian mobile number.\n\n" +
          "Number 6, 7, 8 ya 9 se start hona chahiye.\n" +
          "1234567890, 1111111111, 9999999999 jaise fake numbers allowed nahi hain.",
      );

      return;
    }

    // ===============================================
    // ALTERNATE MOBILE
    // ===============================================

    if (address.alternatePhone) {
      if (!isValidIndianMobile(address.alternatePhone)) {
        alert("Please enter a valid alternate Indian mobile number.");

        return;
      }

      if (address.alternatePhone === address.mobile) {
        alert(
          "Alternate phone number primary mobile number se different hona chahiye.",
        );

        return;
      }
    }

    // ===============================================
    // PINCODE FORMAT
    // ===============================================

    if (!/^\d{6}$/.test(address.pincode)) {
      alert("Please enter a valid 6-digit pincode.");

      return;
    }

    // ===============================================
    // USER LOGIN
    // ===============================================

    const userId = getUserId();

    if (!userId) {
      alert("Please login first.");

      return;
    }

    // ===============================================
    // LOCATION MUST EXIST
    // ===============================================

    if (!selectedLocation) {
      alert(
        "Please select your real delivery location using the map or current location.",
      );

      return;
    }

    // ===============================================
    // COORDINATES
    // ===============================================

    const latitude = Number(selectedLocation.latitude);

    const longitude = Number(selectedLocation.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      alert("Selected location is invalid. Please select location again.");

      return;
    }

    // ===============================================
    // START SAVING
    // ===============================================

    setSavingAddress(true);

    try {
      // =============================================
      // VERIFY REAL PINCODE
      // =============================================

      const pincodeResult = await verifyPincode(address.pincode);

      if (!pincodeResult.valid) {
        alert(
          pincodeResult.message ||
            "Ye pincode India Post records me valid nahi hai.",
        );

        setSavingAddress(false);

        return;
      }

      console.log("VALID PINCODE:", pincodeResult.pincode);

      console.log("POST OFFICES:", pincodeResult.postOffices);

      // =============================================
      // LOCATION PINCODE
      // =============================================

      const locationPincode =
        selectedLocation?.address?.pincode || mapAddress?.pincode || "";

      // =============================================
      // PINCODE MISMATCH
      // =============================================

      if (
        locationPincode &&
        /^\d{6}$/.test(locationPincode) &&
        locationPincode !== address.pincode
      ) {
        const confirmPincode = window.confirm(
          `Selected map location ka pincode ${locationPincode} hai,\n` +
            `lekin aapne ${address.pincode} enter kiya hai.\n\n` +
            `Kya aap phir bhi continue karna chahte hain?`,
        );

        if (!confirmPincode) {
          setSavingAddress(false);

          return;
        }
      }

      // =============================================
      // FINAL LOCATION
      // =============================================

      const finalLocation = {
        latitude,
        longitude,

        accuracy: selectedLocation.accuracy || gpsAccuracy || null,

        displayName: selectedLocation.displayName || "",
      };

      // =============================================
      // FINAL ADDRESS
      // =============================================

      const finalAddress = {
        userId,

        name: address.name.trim(),

        mobile: address.mobile.trim(),

        pincode: address.pincode.trim(),

        area: address.area.trim(),

        house: address.house.trim(),

        city: address.city.trim(),

        district: address.district.trim(),

        state: address.state.trim(),

        landmark: address.landmark ? address.landmark.trim() : "",

        alternatePhone: address.alternatePhone
          ? address.alternatePhone.trim()
          : "",

        addressType,

        location: finalLocation,

        // =========================================
        // PINCODE VERIFICATION DATA
        // =========================================

        pincodeVerified: true,

        pincodePostOffice: pincodeResult.postOffice?.Name || "",

        pincodeDistrict: pincodeResult.postOffice?.District || "",

        pincodeState: pincodeResult.postOffice?.State || "",
      };

      // =============================================
      // DEBUG
      // =============================================

      console.log("FINAL VERIFIED ADDRESS:", finalAddress);

      // =============================================
      // SAVE TO MONGODB
      // =============================================

      const response = await axios.post(
        "https://apnabazar-6zxf.onrender.com/api/addresses/save",
        finalAddress,
      );

      console.log("ADDRESS MONGODB RESPONSE:", response.data);

      // =============================================
      // LOCAL STORAGE
      // =============================================

      localStorage.setItem("bookingAddress", JSON.stringify(finalAddress));

      // =============================================
      // SAVE LOCATION
      // =============================================

      localStorage.setItem(
        "savedLocation",
        JSON.stringify({
          latitude: finalLocation.latitude,

          longitude: finalLocation.longitude,

          accuracy: finalLocation.accuracy,

          displayName: finalLocation.displayName,

          address: {
            pincode: finalAddress.pincode,

            area: finalAddress.area,

            house: finalAddress.house,

            city: finalAddress.city,

            district: finalAddress.district,

            state: finalAddress.state,
          },

          savedAt: new Date().toISOString(),
        }),
      );

      // =============================================
      // SUCCESS
      // =============================================

      alert(
        response.data?.message || "Address verified and saved successfully!",
      );

      // =============================================
      // ORDER SUMMARY
      // =============================================

      navigate("/order-summary", {
        state: {
          service,
          desc,
          price,
          address: finalAddress,
        },
      });
    } catch (error) {
      console.error("SAVE ADDRESS ERROR:", error);

      console.error("SERVER RESPONSE:", error.response?.data);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Address save nahi ho paya. Please try again.");
      }
    } finally {
      setSavingAddress(false);
    }
  };

  // ===================================================
  // JSX
  // ===================================================

  return (
    <div className="address-page">
      <div className="address-card">
        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="location-search-section">
          <div className="location-search">
            <FiSearch />

            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchLocation();
                }
              }}
              placeholder="Search area, village, street or pincode"
            />

            <button
              type="button"
              onClick={searchLocation}
              disabled={searchLoading}
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* SEARCH RESULTS */}

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <button
                  key={
                    result.place_id || `${result.lat}-${result.lon}-${index}`
                  }
                  type="button"
                  className="search-result"
                  onClick={() => selectSearchLocation(result)}
                >
                  <FiMapPin />

                  <span>{result.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* =================================================
            LOCATION BUTTONS
        ================================================= */}

        <div className="location-actions">
          <button
            className="location-map-button"
            type="button"
            onClick={openMap}
          >
            <FiMapPin />

            <span>Select location on map</span>
          </button>

          <button
            className="location-btn"
            type="button"
            onClick={handleCurrentLocation}
            disabled={locationLoading}
          >
            <FiCrosshair />

            {locationLoading
              ? "Detecting your location..."
              : "Use my current location"}
          </button>
        </div>

        {/* =================================================
            SAVED LOCATION
        ================================================= */}

        {locationSaved && selectedLocation && (
          <div className="saved-location-box">
            <div className="saved-location-left">
              <div className="saved-icon">
                <FiCheck />
              </div>

              <div>
                <strong>Location saved</strong>

                <p>
                  {selectedLocation.displayName ||
                    `${address.area}, ${address.district}, ${address.state} - ${address.pincode}`}
                </p>
              </div>
            </div>

            <button type="button" onClick={removeSavedLocation}>
              Change
            </button>
          </div>
        )}

        {/* =================================================
            NAME + MOBILE
        ================================================= */}

        <div className="row">
          <input
            name="name"
            value={address.name}
            onChange={handleChange}
            type="text"
            placeholder="Name"
          />

          <input
            name="mobile"
            value={address.mobile}
            onChange={handleChange}
            type="tel"
            maxLength={10}
            inputMode="numeric"
            pattern="[6-9][0-9]{9}"
            placeholder="10-digit mobile number"
          />
        </div>

        {/* =================================================
            PINCODE + AREA
        ================================================= */}

        <div className="row">
          <input
            name="pincode"
            value={address.pincode}
            onChange={handleChange}
            type="text"
            maxLength={6}
            inputMode="numeric"
            placeholder="Pincode"
          />

          <input
            name="area"
            value={address.area}
            onChange={handleChange}
            type="text"
            placeholder="Locality / Area"
          />
        </div>

        {/* =================================================
            HOUSE
        ================================================= */}

        <textarea
          name="house"
          value={address.house}
          onChange={handleChange}
          rows="4"
          placeholder="Address (Area and Street)"
        />

        {/* =================================================
            CITY + DISTRICT
        ================================================= */}

        <div className="row">
          <input
            name="city"
            value={address.city}
            onChange={handleChange}
            type="text"
            placeholder="City / Town"
          />

          {address.state === "Bihar" ? (
            <select
              name="district"
              value={address.district}
              onChange={handleChange}
            >
              <option value="">-- Select District --</option>

              {biharDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          ) : (
            <input
              name="district"
              value={address.district}
              onChange={handleChange}
              type="text"
              placeholder="District"
            />
          )}
        </div>

        {/* =================================================
            STATE + LANDMARK
        ================================================= */}

        <div className="row">
          <select name="state" value={address.state} onChange={handleChange}>
            <option value="">-- Select State --</option>

            {indianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <input
            name="landmark"
            value={address.landmark}
            onChange={handleChange}
            type="text"
            placeholder="Landmark (Optional)"
          />
        </div>

        {/* =================================================
            ALTERNATE PHONE
        ================================================= */}

        <div className="row">
          <input
            name="alternatePhone"
            value={address.alternatePhone}
            onChange={handleChange}
            type="tel"
            maxLength={10}
            inputMode="numeric"
            pattern="[6-9][0-9]{9}"
            placeholder="Alternate Phone (Optional)"
          />
        </div>

        {/* =================================================
            ADDRESS TYPE
        ================================================= */}

        <p className="type-title">Address Type</p>

        <div className="address-type">
          <label>
            <input
              type="radio"
              checked={addressType === "Home"}
              onChange={() => setAddressType("Home")}
            />
            Home
          </label>

          <label>
            <input
              type="radio"
              checked={addressType === "Work"}
              onChange={() => setAddressType("Work")}
            />
            Work
          </label>
        </div>

        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="buttons">
          <button
            className="save-btn"
            type="button"
            onClick={saveAddress}
            disabled={savingAddress}
          >
            {savingAddress ? "VERIFYING & SAVING..." : "SAVE"}
          </button>

          <button
            className="cancel-btn"
            type="button"
            onClick={() => navigate(-1)}
            disabled={savingAddress}
          >
            CANCEL
          </button>
        </div>
      </div>

      {/* =================================================
          MAP MODAL
      ================================================= */}

      {showMap && (
        <div className="map-overlay">
          <div className="map-modal">
            {/* HEADER */}

            <div className="map-header">
              <div>
                <h3>Select your location</h3>

                <p>Search, click or drag the marker</p>
              </div>

              <button
                type="button"
                className="map-close"
                onClick={() => setShowMap(false)}
              >
                <FiX />
              </button>
            </div>

            {/* MAP */}

            <div className="map-container">
              {mapPosition ? (
                <MapContainer
                  center={mapPosition}
                  zoom={17}
                  scrollWheelZoom={true}
                  className="location-map"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapController position={mapPosition} />

                  <MapClickHandler onLocationChange={handleMapPositionChange} />

                  <LocationMarker
                    position={mapPosition}
                    onLocationChange={handleMapPositionChange}
                  />
                </MapContainer>
              ) : (
                <div className="map-loading">
                  <FiMapPin />

                  <p>Loading map...</p>
                </div>
              )}

              {/* CURRENT LOCATION */}

              <button
                type="button"
                className="map-current-location"
                onClick={getCurrentLocation}
                disabled={locationLoading}
              >
                <FiNavigation />

                {locationLoading ? "Detecting..." : "Use my current location"}
              </button>

              {/* GPS ACCURACY */}

              {gpsAccuracy && (
                <div className="gps-accuracy">
                  GPS accuracy: {Math.round(gpsAccuracy)}m
                </div>
              )}
            </div>

            {/* =================================================
                SELECTED ADDRESS
            ================================================= */}

            {mapAddress && (
              <div className="map-selected-address">
                <FiMapPin />

                <div>
                  <strong>
                    {mapAddress.area || mapAddress.city || "Selected Location"}
                  </strong>

                  <p>{mapAddress.displayName}</p>

                  <div className="location-details">
                    {mapAddress.pincode && (
                      <span>Pincode: {mapAddress.pincode}</span>
                    )}

                    {mapAddress.district && (
                      <span>District: {mapAddress.district}</span>
                    )}

                    {mapAddress.state && <span>State: {mapAddress.state}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* FOOTER */}

            <div className="map-footer">
              <button
                type="button"
                className="map-save-btn"
                disabled={!mapPosition || !mapAddress || locationLoading}
                onClick={saveMapLocation}
              >
                <FiCheck />
                Save this location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingAddress;
