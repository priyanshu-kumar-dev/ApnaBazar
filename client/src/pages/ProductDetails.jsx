import "./ProductDetails.css";

import { useParams, useNavigate } from "react-router-dom";
import products from "../data/Product";
import forYouProducts from "../data/ForYouProduct";

import { useEffect, useMemo, useState } from "react";

import {
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiHeart,
  FiShare2,
  FiCamera,
  FiX,
  FiThumbsUp,
  FiThumbsDown,
} from "react-icons/fi";

import { FaChevronLeft, FaChevronRight, FaShoppingCart } from "react-icons/fa";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const allProducts = [...products, ...forYouProducts];

  const selectedProduct = allProducts.find(
    (item) => String(item.id) === String(id),
  );

  /* =========================================================
     BASIC STATES
  ========================================================= */

  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewImage, setReviewImage] = useState(null);

  const [detailsTab, setDetailsTab] = useState("Specifications");

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedColorImage, setSelectedColorImage] = useState("");

  const [selectedVariant, setSelectedVariant] = useState(null);

  const [selectedSize, setSelectedSize] = useState("");

  const [openSection, setOpenSection] = useState({
    peace: false,
    highlights: false,
    details: false,
    reviews: false,
  });

  /* =========================================================
     CATEGORY
  ========================================================= */

  const category = String(selectedProduct?.category || "").toLowerCase();

  const isMobile = category.includes("mobile") || category.includes("phone");

  const isLaptop = category.includes("laptop") || category.includes("computer");

  const isTV =
    category.includes("tv") ||
    category.includes("television") ||
    category.includes("appliance");

  const isFashion =
    category.includes("fashion") ||
    category.includes("shirt") ||
    category.includes("tshirt") ||
    category.includes("clothing") ||
    category.includes("dress") ||
    category.includes("jeans") ||
    category.includes("kurta");

  const isShoes =
    category.includes("shoe") ||
    category.includes("footwear") ||
    category.includes("sandal");

  const isBeauty = category.includes("beauty");

  const isHome = category.includes("home");

  const isToys = category.includes("toy") || category.includes("game");

  const isFood =
    category.includes("food") ||
    category.includes("dry fruit") ||
    category.includes("grocery");

  const isSports = category.includes("sport") || category.includes("cricket");

  const isFurniture =
    category.includes("furniture") || category.includes("mattress");

  const isBooks = category.includes("book");

  const isAutoAccessories =
    category.includes("auto") ||
    category.includes("accessories") ||
    category.includes("dashcam");

  const isTwoWheeler =
    category.includes("two wheeler") ||
    category.includes("bike") ||
    category.includes("motorcycle");

  /* =========================================================
     COLOR OPTIONS
  ========================================================= */

  const finalColors = useMemo(() => {
    if (!selectedProduct) return [];

    const colors = selectedProduct.colors || selectedProduct.colorOptions || [];

    if (!Array.isArray(colors)) return [];

    return colors.map((color, index) => {
      if (typeof color === "string") {
        return {
          id: index,
          name: color,
          image: "",
          thumbnails: [],
          price: null,
          originalPrice: null,
          discount: null,
        };
      }

      return {
        ...color,

        id: color.id ?? index,

        name: color.name || "",

        image: color.image || "",

        thumbnails: Array.isArray(color.thumbnails) ? color.thumbnails : [],

        price:
          color.price !== undefined && color.price !== null
            ? Number(color.price)
            : null,

        originalPrice:
          color.originalPrice !== undefined && color.originalPrice !== null
            ? Number(color.originalPrice)
            : null,

        discount:
          color.discount !== undefined && color.discount !== null
            ? Number(color.discount)
            : null,
      };
    });
  }, [selectedProduct]);

  /* =========================================================
     SELECTED COLOR OBJECT
  ========================================================= */

  const selectedColorData = useMemo(() => {
    if (!finalColors.length) return null;

    return (
      finalColors.find((color) => color.name === selectedColor) ||
      finalColors[0]
    );
  }, [finalColors, selectedColor]);

  /* =========================================================
     COLOR PRICE
  ========================================================= */

  const colorPriceData = useMemo(() => {
    if (!selectedColorData) return null;

    const hasPrice =
      selectedColorData.price !== null && selectedColorData.price !== undefined;

    const hasOriginalPrice =
      selectedColorData.originalPrice !== null &&
      selectedColorData.originalPrice !== undefined;

    const hasDiscount =
      selectedColorData.discount !== null &&
      selectedColorData.discount !== undefined;

    if (!hasPrice && !hasOriginalPrice && !hasDiscount) {
      return null;
    }

    return {
      price: hasPrice ? selectedColorData.price : selectedProduct?.price,

      originalPrice: hasOriginalPrice
        ? selectedColorData.originalPrice
        : selectedProduct?.originalPrice,

      discount: hasDiscount
        ? selectedColorData.discount
        : selectedProduct?.discount,
    };
  }, [selectedColorData, selectedProduct]);

  /* =========================================================
     GENERIC VARIANT NORMALIZER
  ========================================================= */

  const normalizeVariant = (variant, index) => {
    if (!selectedProduct) {
      return null;
    }

    if (typeof variant === "string" || typeof variant === "number") {
      return {
        id: index,
        name: String(variant),

        price: Number(selectedProduct.price || 0),

        originalPrice: Number(selectedProduct.originalPrice || 0),

        discount:
          selectedProduct.discount != null
            ? Number(selectedProduct.discount)
            : null,
      };
    }

    const variantName =
      variant.name ||
      variant.label ||
      variant.title ||
      variant.size ||
      variant.screenSize ||
      variant.storage ||
      `${variant.ram || ""}${
        variant.ram && variant.rom ? " + " : ""
      }${variant.rom || ""}`.trim();

    return {
      ...variant,

      id: variant.id ?? index,

      name: variantName || `Variant ${index + 1}`,

      price:
        variant.price ?? variant.variantPrice ?? selectedProduct.price ?? 0,

      originalPrice:
        variant.originalPrice ??
        variant.variantOriginalPrice ??
        selectedProduct.originalPrice ??
        0,

      discount:
        variant.discount ??
        variant.variantDiscount ??
        selectedProduct.discount ??
        null,
    };
  };

  /* =========================================================
     VARIANT OPTIONS - ALL CATEGORIES
  ========================================================= */

  const variantOptions = useMemo(() => {
    if (!selectedProduct) return [];

    /* ---------------------------------------------------------
       1. FIRST PRIORITY: variants
       --------------------------------------------------------- */

    if (
      Array.isArray(selectedProduct.variants) &&
      selectedProduct.variants.length > 0
    ) {
      return selectedProduct.variants.map(normalizeVariant).filter(Boolean);
    }

    /* ---------------------------------------------------------
       2. variantOptions
       --------------------------------------------------------- */

    if (
      Array.isArray(selectedProduct.variantOptions) &&
      selectedProduct.variantOptions.length > 0
    ) {
      return selectedProduct.variantOptions
        .map(normalizeVariant)
        .filter(Boolean);
    }

    /* ---------------------------------------------------------
       3. MOBILE
       --------------------------------------------------------- */

    if (
      isMobile &&
      Array.isArray(selectedProduct.mobileVariants) &&
      selectedProduct.mobileVariants.length > 0
    ) {
      return selectedProduct.mobileVariants
        .map(normalizeVariant)
        .filter(Boolean);
    }

    /* ---------------------------------------------------------
       4. LAPTOP
       --------------------------------------------------------- */

    if (
      isLaptop &&
      Array.isArray(selectedProduct.laptopVariants) &&
      selectedProduct.laptopVariants.length > 0
    ) {
      return selectedProduct.laptopVariants
        .map(normalizeVariant)
        .filter(Boolean);
    }

    /* ---------------------------------------------------------
       5. TV
       --------------------------------------------------------- */

    if (
      isTV &&
      Array.isArray(selectedProduct.tvVariants) &&
      selectedProduct.tvVariants.length > 0
    ) {
      return selectedProduct.tvVariants.map(normalizeVariant).filter(Boolean);
    }

    /* ---------------------------------------------------------
       6. ELECTRONICS
       --------------------------------------------------------- */

    if (
      category.includes("electronics") &&
      (selectedProduct.RAM ||
        selectedProduct.ROM ||
        selectedProduct.ram ||
        selectedProduct.rom)
    ) {
      const ram = selectedProduct.RAM || selectedProduct.ram || "";

      const rom = selectedProduct.ROM || selectedProduct.rom || "";

      return [
        {
          id: "default-electronics",
          name: `${ram} GB + ${rom} GB`,

          ram: `${ram} GB`,
          rom: `${rom} GB`,

          price: Number(selectedProduct.price || 0),

          originalPrice: Number(selectedProduct.originalPrice || 0),

          discount: selectedProduct.discount ?? null,
        },
      ];
    }

    /* ---------------------------------------------------------
       7. BEAUTY
       
       Example:
       oml: 100
       tml: 200
       fml: 500
       
       Better data:
       variantPrices: {
          oml: { price: 699, originalPrice: 999 },
          tml: { price: 999, originalPrice: 1299 },
          fml: { price: 1599, originalPrice: 1999 }
       }
       --------------------------------------------------------- */

    if (isBeauty) {
      const beautyKeys = [
        ["oml", "100 ML"],
        ["tml", "200 ML"],
        ["fml", "500 ML"],
      ];

      const result = [];

      beautyKeys.forEach(([key, label], index) => {
        if (
          selectedProduct[key] !== undefined &&
          selectedProduct[key] !== null
        ) {
          const variantPrice = selectedProduct.variantPrices?.[key] || {};

          result.push({
            id: `beauty-${key}-${index}`,
            name: `${selectedProduct[key]} ML`,

            value: selectedProduct[key],

            price: variantPrice.price ?? selectedProduct.price ?? 0,

            originalPrice:
              variantPrice.originalPrice ?? selectedProduct.originalPrice ?? 0,

            discount: variantPrice.discount ?? selectedProduct.discount ?? null,
          });
        }
      });

      if (result.length > 0) {
        return result;
      }
    }

    /* ---------------------------------------------------------
       8. HOME
       
       Example:
       ol: 1
       tl: 2
       fl: 5
       --------------------------------------------------------- */

    if (isHome) {
      const homeKeys = [
        ["ol", "1 L"],
        ["tl", "2 L"],
        ["fl", "5 L"],
      ];

      const result = [];

      homeKeys.forEach(([key, label], index) => {
        if (
          selectedProduct[key] !== undefined &&
          selectedProduct[key] !== null
        ) {
          const variantPrice = selectedProduct.variantPrices?.[key] || {};

          result.push({
            id: `home-${key}-${index}`,

            name: `${selectedProduct[key]} L`,

            value: selectedProduct[key],

            price: variantPrice.price ?? selectedProduct.price ?? 0,

            originalPrice:
              variantPrice.originalPrice ?? selectedProduct.originalPrice ?? 0,

            discount: variantPrice.discount ?? selectedProduct.discount ?? null,
          });
        }
      });

      if (result.length > 0) {
        return result;
      }
    }

    /* ---------------------------------------------------------
       9. OTHER CATEGORIES
       --------------------------------------------------------- */

    const genericVariantKeys = [
      "variantsList",
      "options",
      "configurations",
      "models",
      "sizes",
      "storageOptions",
    ];

    for (const key of genericVariantKeys) {
      if (
        Array.isArray(selectedProduct[key]) &&
        selectedProduct[key].length > 0
      ) {
        return selectedProduct[key].map(normalizeVariant).filter(Boolean);
      }
    }

    /* ---------------------------------------------------------
       10. GENERIC SINGLE VARIANT FROM PRODUCT DATA
       --------------------------------------------------------- */

    const genericValues = [];

    if (selectedProduct.RAM && selectedProduct.ROM) {
      genericValues.push({
        id: "ram-rom",
        name: `${selectedProduct.RAM} GB + ${selectedProduct.ROM} GB`,

        ram: `${selectedProduct.RAM} GB`,
        rom: `${selectedProduct.ROM} GB`,

        price: selectedProduct.price,
        originalPrice: selectedProduct.originalPrice,
        discount: selectedProduct.discount,
      });
    }

    return genericValues;
  }, [selectedProduct, category, isMobile, isLaptop, isTV, isBeauty, isHome]);

  /* =========================================================
     SIZE OPTIONS
  ========================================================= */

  const sizeOptions = useMemo(() => {
    if (!selectedProduct) return [];

    /* ---------------------------------------------------------
       sizes
       --------------------------------------------------------- */

    if (
      Array.isArray(selectedProduct.sizes) &&
      selectedProduct.sizes.length > 0
    ) {
      return selectedProduct.sizes.map((size, index) => {
        if (typeof size === "string") {
          return {
            id: index,
            name: size,

            price: selectedProduct.price,

            originalPrice: selectedProduct.originalPrice,

            discount: selectedProduct.discount,
          };
        }

        return {
          ...size,

          id: size.id ?? index,

          name: size.name || size.label || size.size || "",

          price: size.price ?? size.sizePrice ?? selectedProduct.price,

          originalPrice:
            size.originalPrice ??
            size.sizeOriginalPrice ??
            selectedProduct.originalPrice,

          discount:
            size.discount ?? size.sizeDiscount ?? selectedProduct.discount,
        };
      });
    }

    /* ---------------------------------------------------------
       sizeVariants
       --------------------------------------------------------- */

    if (
      Array.isArray(selectedProduct.sizeVariants) &&
      selectedProduct.sizeVariants.length > 0
    ) {
      return selectedProduct.sizeVariants.map((size, index) => ({
        ...size,

        id: size.id ?? index,

        name: size.name || size.label || size.size || "",

        price: size.price ?? size.sizePrice ?? selectedProduct.price,

        originalPrice:
          size.originalPrice ??
          size.sizeOriginalPrice ??
          selectedProduct.originalPrice,

        discount:
          size.discount ?? size.sizeDiscount ?? selectedProduct.discount,
      }));
    }

    /* ---------------------------------------------------------
       OLD FASHION SIZE FORMAT
       --------------------------------------------------------- */

    if (isFashion || isShoes) {
      return [
        selectedProduct.sort || "S",
        selectedProduct.medium || "M",
        selectedProduct.long || "L",
        selectedProduct.xlong || "XL",
        selectedProduct.dlong || "XXL",
        selectedProduct.tlong || "3XL",
      ]
        .filter(Boolean)
        .map((size, index) => ({
          id: index,

          name: size,

          price: selectedProduct.price,

          originalPrice: selectedProduct.originalPrice,

          discount: selectedProduct.discount,
        }));
    }

    return [];
  }, [selectedProduct, isFashion, isShoes]);

  /* =========================================================
     CURRENT PRICE
     
     Priority:
     
     Fashion/Shoes -> Size price
     Variant categories -> Variant price
     Color -> Color price
     Default -> Product price
  ========================================================= */

  const currentPriceData = useMemo(() => {
    if (!selectedProduct) {
      return {
        price: 0,
        originalPrice: 0,
        discount: null,
      };
    }

    /* ---------------------------------------------------------
       FASHION / SHOES
       --------------------------------------------------------- */

    if ((isFashion || isShoes) && selectedSize) {
      const sizeData = sizeOptions.find(
        (size) => String(size.name) === String(selectedSize),
      );

      if (sizeData) {
        return {
          price: Number(sizeData.price ?? selectedProduct.price ?? 0),

          originalPrice: Number(
            sizeData.originalPrice ?? selectedProduct.originalPrice ?? 0,
          ),

          discount: sizeData.discount ?? selectedProduct.discount ?? null,
        };
      }
    }

    /* ---------------------------------------------------------
       ALL VARIANT CATEGORIES
       --------------------------------------------------------- */

    if (selectedVariant && variantOptions.length > 0) {
      return {
        price: Number(
          selectedVariant.price ??
            selectedVariant.variantPrice ??
            selectedProduct.price ??
            0,
        ),

        originalPrice: Number(
          selectedVariant.originalPrice ??
            selectedVariant.variantOriginalPrice ??
            selectedProduct.originalPrice ??
            0,
        ),

        discount:
          selectedVariant.discount ??
          selectedVariant.variantDiscount ??
          selectedProduct.discount ??
          null,
      };
    }

    /* ---------------------------------------------------------
       COLOR PRICE
       --------------------------------------------------------- */

    if (selectedColorData) {
      const hasColorPrice =
        selectedColorData.price !== null &&
        selectedColorData.price !== undefined &&
        selectedColorData.price !== "";

      const hasColorOriginalPrice =
        selectedColorData.originalPrice !== null &&
        selectedColorData.originalPrice !== undefined &&
        selectedColorData.originalPrice !== "";

      const hasColorDiscount =
        selectedColorData.discount !== null &&
        selectedColorData.discount !== undefined &&
        selectedColorData.discount !== "";

      if (hasColorPrice || hasColorOriginalPrice || hasColorDiscount) {
        return {
          price: Number(
            hasColorPrice
              ? selectedColorData.price
              : (selectedProduct.price ?? 0),
          ),

          originalPrice: Number(
            hasColorOriginalPrice
              ? selectedColorData.originalPrice
              : (selectedProduct.originalPrice ?? 0),
          ),

          discount: hasColorDiscount
            ? Number(selectedColorData.discount)
            : (selectedProduct.discount ?? null),
        };
      }
    }

    /* ---------------------------------------------------------
       DEFAULT
       --------------------------------------------------------- */

    return {
      price: Number(selectedProduct.price ?? 0),

      originalPrice: Number(selectedProduct.originalPrice ?? 0),

      discount: selectedProduct.discount ?? null,
    };
  }, [
    selectedProduct,
    selectedVariant,
    selectedSize,
    selectedColorData,
    variantOptions,
    sizeOptions,
    isFashion,
    isShoes,
  ]);

  const currentPrice = currentPriceData.price;

  const currentOriginalPrice = currentPriceData.originalPrice;

  const currentDiscount = currentPriceData.discount;

  /* =========================================================
     COLOR IMAGES
  ========================================================= */

  const colorImages = useMemo(() => {
    if (!selectedProduct) return [];

    if (selectedColorData) {
      const images = [
        selectedColorData.image,
        ...(selectedColorData.thumbnails || []),
      ].filter(Boolean);

      if (images.length > 0) {
        return [...new Set(images)];
      }
    }

    return [
      selectedProduct.image,
      ...(selectedProduct.images || []),
      ...(selectedProduct.thumbnails || []),
    ].filter(Boolean);
  }, [selectedProduct, selectedColorData]);

  /* =========================================================
     CURRENT IMAGE
  ========================================================= */

  const currentImage =
    colorImages[currentIndex] ||
    selectedColorImage ||
    selectedProduct?.image ||
    "";

  /* =========================================================
     DEFAULT OPTIONS
  ========================================================= */

  useEffect(() => {
    if (!selectedProduct) return;

    /* COLOR */

    const colors = selectedProduct.colors || selectedProduct.colorOptions || [];

    if (Array.isArray(colors) && colors.length > 0) {
      const firstColor =
        typeof colors[0] === "string" ? colors[0] : colors[0]?.name || "";

      setSelectedColor(firstColor || selectedProduct.color || "");

      const firstColorImage =
        typeof colors[0] === "string" ? "" : colors[0]?.image || "";

      setSelectedColorImage(firstColorImage);
    } else {
      setSelectedColor(selectedProduct.color || "");

      setSelectedColorImage(selectedProduct.image || "");
    }

    /* VARIANT */

    if (variantOptions.length > 0) {
      setSelectedVariant(variantOptions[0]);
    } else {
      setSelectedVariant(null);
    }

    /* SIZE */

    if ((isFashion || isShoes) && sizeOptions.length > 0) {
      setSelectedSize(sizeOptions[0].name);
    } else {
      setSelectedSize(selectedProduct.size || "");
    }

    setCurrentIndex(0);
  }, [selectedProduct, variantOptions, sizeOptions, isFashion, isShoes]);

  /* =========================================================
     COLOR CHANGE
  ========================================================= */

  useEffect(() => {
    if (!selectedColorData) return;

    setSelectedColorImage(selectedColorData.image || "");

    setCurrentIndex(0);
  }, [selectedColorData]);

  /* =========================================================
     SIZE CHANGE
  ========================================================= */

  const handleSizeChange = (size) => {
    if (!size) return;

    setSelectedSize(size.name);

    if (isFashion || isShoes) {
      setSelectedVariant(null);
    }
  };

  /* =========================================================
     VARIANT CHANGE
  ========================================================= */

  const handleVariantChange = (variant) => {
    if (!variant) return;

    setSelectedVariant(variant);

    /*
      Agar variant ka name size ke
      equal ho to size bhi update hoga.
    */

    if (
      variant.name &&
      sizeOptions.some((size) => size.name === variant.name)
    ) {
      setSelectedSize(variant.name);
    }
  };

  /* =========================================================
     CART
  ========================================================= */

  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;

    const timer = setTimeout(() => {
      setAdded(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [added]);

  /* =========================================================
     REVIEWS
  ========================================================= */

  const reviewStorageKey = `productReviews_${id}`;

  const [reviewsList, setReviewsList] = useState(() => {
    try {
      const savedReviews = localStorage.getItem(`productReviews_${id}`);

      return savedReviews ? JSON.parse(savedReviews) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(reviewStorageKey, JSON.stringify(reviewsList));
    } catch (error) {
      console.error("Review save error:", error);
    }
  }, [reviewsList, reviewStorageKey]);

  /* =========================================================
     ZOOM
  ========================================================= */

  useEffect(() => {
    document.body.style.overflow = zoomOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [zoomOpen]);

  /* =========================================================
     ADDRESS
  ========================================================= */

  const [deliveryAddress, setDeliveryAddress] = useState(null);

  useEffect(() => {
    try {
      const savedAddress = localStorage.getItem("deliveryAddress");

      if (savedAddress) {
        setDeliveryAddress(JSON.parse(savedAddress));
      }
    } catch (error) {
      console.error("Address error:", error);
    }
  }, []);

  /* =========================================================
     REVIEW IMAGE
  ========================================================= */

  const handleReviewImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("Image should be less than 3 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setReviewImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  /* =========================================================
     POST REVIEW
  ========================================================= */

  const handlePostReview = () => {
    if (!reviewText.trim()) {
      alert("Please write your review.");
      return;
    }

    const newReview = {
      id: Date.now(),

      productId: selectedProduct.id,

      rating: reviewRating,

      text: reviewText.trim(),

      image: reviewImage,

      name: "You",

      date: "Just now",

      verified: true,

      likes: 0,

      dislikes: 0,
    };

    setReviewsList((prev) => [newReview, ...prev]);

    setReviewText("");
    setReviewRating(5);
    setReviewImage(null);
    setShowReviewForm(false);
  };

  const removeReviewImage = () => {
    setReviewImage(null);
  };

  /* =========================================================
     REVIEW VOTE
  ========================================================= */

  const handleReviewVote = (reviewId, type) => {
    setReviewsList((prev) =>
      prev.map((review) => {
        if (review.id !== reviewId) {
          return review;
        }

        if (type === "like") {
          return {
            ...review,

            likes: (review.likes || 0) + 1,
          };
        }

        return {
          ...review,

          dislikes: (review.dislikes || 0) + 1,
        };
      }),
    );
  };

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const handleAddToCart = () => {
    try {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const cartVariantKey = selectedVariant
        ? [
            selectedVariant.id || "",

            selectedVariant.name || "",

            selectedVariant.ram || "",

            selectedVariant.rom || "",

            selectedVariant.value || "",
          ].join("-")
        : "";

      const exists = cart.find(
        (item) =>
          String(item.id) === String(selectedProduct.id) &&
          item.selectedColor === selectedColor &&
          item.cartVariantKey === cartVariantKey &&
          item.selectedSize === selectedSize,
      );

      if (!exists) {
        const cartProduct = {
          ...selectedProduct,

          selectedColor,

          selectedColorImage,

          selectedVariant,

          selectedSize,

          cartVariantKey,

          price: currentPrice,

          originalPrice: currentOriginalPrice,

          discount: currentDiscount,

          quantity: 1,
        };

        cart.push(cartProduct);

        localStorage.setItem("cart", JSON.stringify(cart));
      }

      setAdded(true);
    } catch (error) {
      console.error("Cart error:", error);
    }
  };

  /* =========================================================
     BUY NOW
  ========================================================= */

  const handleBuyNow = () => {
    const buyProduct = {
      ...selectedProduct,

      selectedColor,

      selectedColorImage,

      selectedVariant,

      selectedSize,

      price: currentPrice,

      originalPrice: currentOriginalPrice,

      discount: currentDiscount,

      quantity: 1,
    };

    localStorage.setItem("buyProduct", JSON.stringify(buyProduct));

    navigate("/booking-address");
  };

  /* =========================================================
     SECTION TOGGLE
  ========================================================= */

  const toggleSection = (section) => {
    setOpenSection((prev) => ({
      ...prev,

      [section]: !prev[section],
    }));
  };

  /* =========================================================
     IMAGE NAVIGATION
  ========================================================= */

  const handlePrevious = () => {
    if (!colorImages.length) return;

    setCurrentIndex((prev) => (prev === 0 ? colorImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!colorImages.length) return;

    setCurrentIndex((prev) => (prev === colorImages.length - 1 ? 0 : prev + 1));
  };

  /* =========================================================
     SHARE
  ========================================================= */

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: selectedProduct.title,

          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);

        alert("Product link copied!");
      }
    } catch {
      console.log("Share cancelled");
    }
  };

  /* =========================================================
     RATING
  ========================================================= */

  const productRating = Number(selectedProduct?.rating) || 3.7;

  const totalRatings = Number(selectedProduct?.reviews) || 97206;

  const ratingDistribution = {
    5: 62,
    4: 24,
    3: 8,
    2: 3,
    1: 3,
  };

  const getReviewTitle = (rating) => {
    if (rating >= 5) return "Excellent";

    if (rating >= 4) return "Good choice";

    if (rating >= 3) return "Average";

    return "Could be better";
  };

  /* =========================================================
     PRODUCT SPECIFICATIONS
  ========================================================= */

  const specificationDetails = selectedProduct
    ? [
        {
          label: "Brand",

          value: selectedProduct.brand || "Not specified",
        },

        {
          label: "Product",

          value: selectedProduct.title || "Not specified",
        },

        {
          label: "Category",

          value: selectedProduct.category || "Not specified",
        },

        {
          label: "Color",

          value: selectedColor || selectedProduct.color || "Not specified",
        },
      ]
    : [];

  /* MOBILE */

  if (selectedProduct && isMobile) {
    specificationDetails.push(
      {
        label: "RAM",

        value: selectedVariant?.ram || selectedProduct.RAM || "Not specified",
      },

      {
        label: "Storage",

        value:
          selectedVariant?.rom ||
          (selectedProduct.ROM ? `${selectedProduct.ROM} GB` : "Not specified"),
      },

      {
        label: "Display",

        value:
          selectedProduct.display || selectedProduct.screen || "Not specified",
      },

      {
        label: "Battery",

        value: selectedProduct.battery || "Not specified",
      },

      {
        label: "Processor",

        value:
          selectedProduct.processor ||
          selectedProduct.chipset ||
          "Not specified",
      },
    );
  }

  /* LAPTOP */

  if (selectedProduct && isLaptop) {
    specificationDetails.push(
      {
        label: "RAM",

        value: selectedVariant?.ram || selectedProduct.RAM || "Not specified",
      },

      {
        label: "Storage",

        value:
          selectedVariant?.rom ||
          selectedProduct.storage ||
          selectedProduct.ROM ||
          "Not specified",
      },

      {
        label: "Processor",

        value: selectedProduct.processor || "Not specified",
      },

      {
        label: "Graphics",

        value:
          selectedProduct.graphics || selectedProduct.GPU || "Not specified",
      },

      {
        label: "Operating System",

        value:
          selectedProduct.os || selectedProduct.operatingSystem || "Windows",
      },
    );
  }

  /* TV */

  if (selectedProduct && isTV) {
    specificationDetails.push(
      {
        label: "Screen Size",

        value:
          selectedVariant?.name ||
          selectedProduct.screenSize ||
          selectedProduct.size ||
          "Not specified",
      },

      {
        label: "Resolution",

        value: selectedProduct.resolution || "Full HD",
      },

      {
        label: "Display Type",

        value: selectedProduct.displayType || "LED",
      },

      {
        label: "Smart TV",

        value: selectedProduct.smartTV || "Yes",
      },
    );
  }

  /* BEAUTY */

  if (selectedProduct && isBeauty) {
    specificationDetails.push(
      {
        label: "Quantity",

        value: selectedVariant?.name || "Not specified",
      },

      {
        label: "Type",

        value: selectedProduct.productType || "Beauty Product",
      },

      {
        label: "Skin Type",

        value: selectedProduct.skinType || "All Skin Types",
      },
    );
  }

  /* HOME */

  if (selectedProduct && isHome) {
    specificationDetails.push(
      {
        label: "Quantity",

        value: selectedVariant?.name || "Not specified",
      },

      {
        label: "Material",

        value: selectedProduct.material || "Not specified",
      },

      {
        label: "Type",

        value: selectedProduct.productType || "Home Product",
      },
    );
  }

  /* FASHION */

  if (selectedProduct && isFashion) {
    specificationDetails.push(
      {
        label: "Fabric",

        value: selectedProduct.fabric || "Cotton Blend",
      },

      {
        label: "Pattern",

        value: selectedProduct.pattern || "Checkered",
      },

      {
        label: "Sleeve",

        value: selectedProduct.sleeve || "Full Sleeve",
      },

      {
        label: "Fit",

        value: selectedProduct.fit || "Regular",
      },

      {
        label: "Size",

        value: selectedSize || "S",
      },
    );
  }

  /* SHOES */

  if (selectedProduct && isShoes) {
    specificationDetails.push(
      {
        label: "Size",

        value: selectedSize || "Not specified",
      },

      {
        label: "Material",

        value: selectedProduct.material || "Synthetic",
      },

      {
        label: "Sole",

        value: selectedProduct.sole || "Rubber",
      },

      {
        label: "Type",

        value: selectedProduct.shoeType || "Casual",
      },
    );
  }

  /* OTHER CATEGORIES */

  if (
    selectedProduct &&
    !isMobile &&
    !isLaptop &&
    !isTV &&
    !isFashion &&
    !isShoes &&
    !isBeauty &&
    !isHome
  ) {
    specificationDetails.push(
      {
        label: "Variant",

        value: selectedVariant?.name || "Standard",
      },

      {
        label: "Model",

        value: selectedProduct.model || "Not specified",
      },

      {
        label: "Material",

        value: selectedProduct.material || "Not specified",
      },

      {
        label: "Warranty",

        value: selectedProduct.warranty || "1 Year",
      },
    );
  }

  /* =========================================================
     PRODUCT NOT FOUND
  ========================================================= */

  if (!selectedProduct) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>

        <button onClick={() => navigate("/")}>Go to Home</button>
      </div>
    );
  }

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <>
      {/* =====================================================
          ZOOM
      ===================================================== */}

      {zoomOpen && (
        <div className="zoom-overlay">
          <button className="left-btn" onClick={handlePrevious}>
            <FaChevronLeft />
          </button>

          <img src={currentImage} alt={selectedProduct.title} />

          <button className="right-btn" onClick={handleNext}>
            <FaChevronRight />
          </button>

          <button className="close-btn" onClick={() => setZoomOpen(false)}>
            <FiX />
          </button>
        </div>
      )}

      <div className="product-details-container">
        {/* ===================================================
            LEFT IMAGE
        =================================================== */}

        <div className="product-images">
          <div className="thumbnail-images">
            {colorImages.slice(0, 4).map((img, index) => (
              <img
                key={`${img}-${index}`}
                src={img}
                alt={`${selectedColor} ${index + 1}`}
                className={currentIndex === index ? "active-thumbnail" : ""}
                onClick={() => {
                  setCurrentIndex(index);

                  setSelectedColorImage(img);

                  setZoomOpen(true);
                }}
              />
            ))}
          </div>

          <div className="image-actions">
            <button className="icon-btn" title="Wishlist">
              <FiHeart />
            </button>

            <button className="icon-btn" onClick={handleShare} title="Share">
              <FiShare2 />
            </button>
          </div>
        </div>

        {/* ===================================================
            PRODUCT INFO
        =================================================== */}

        <div className="product-info">
          {/* =================================================
              COLOR
          ================================================= */}

          {finalColors.length > 0 && (
            <div className="option-section color-box">
              <div className="option-heading">
                <h3>
                  Select Color:
                  <span> {selectedColor || "Choose color"}</span>
                </h3>
              </div>

              <div className="color-image-options">
                {finalColors.map((color, index) => {
                  const isSelected = selectedColor === color.name;

                  return (
                    <div
                      key={`${color.name}-${index}`}
                      className={`color-image-card ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedColor(color.name);

                        setSelectedColorImage(color.image);

                        setCurrentIndex(0);
                      }}
                    >
                      {color.image && (
                        <img src={color.image} alt={color.name} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================
              ALL CATEGORY VARIANTS
          ================================================= */}

          {variantOptions.length > 0 && !isFashion && !isShoes && (
            <div className="option-section variant-box">
              <h3>
                {isMobile
                  ? "Select Variant"
                  : isLaptop
                    ? "Select Configuration"
                    : isTV
                      ? "Select Screen Size"
                      : isBeauty
                        ? "Select Quantity"
                        : isHome
                          ? "Select Quantity"
                          : "Select Variant"}

                {selectedVariant && <span> {selectedVariant.name}</span>}
              </h3>

              <div className="variant-options">
                {variantOptions.map((variant, index) => {
                  const variantName =
                    variant.name ||
                    variant.label ||
                    `${variant.ram || ""} ${variant.rom || ""}`.trim();

                  const isSelected = selectedVariant?.id === variant.id;

                  return (
                    <button
                      key={`${variantName}-${index}`}
                      type="button"
                      className={`variant-card ${isSelected ? "active" : ""}`}
                      onClick={() => handleVariantChange(variant)}
                    >
                      <strong>{variantName}</strong>

                      <div className="discount-row">
                        {variant.discount != null && (
                          <span className="variant-discount">
                            ↓{variant.discount}%
                          </span>
                        )}

                        {variant.originalPrice != null && (
                          <span className="variant-old-price">
                            ₹
                            {Number(variant.originalPrice).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        )}
                      </div>

                      <p>
                        ₹{Number(variant.price || 0).toLocaleString("en-IN")}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================
              FASHION / SHOES SIZE
          ================================================= */}

          {(isFashion || isShoes) && sizeOptions.length > 0 && (
            <div className="option-section size-box">
              <div className="size-heading">
                <h3>
                  Select Size
                  {selectedSize && (
                    <span>
                      {" : "}
                      {selectedSize}
                    </span>
                  )}
                </h3>

                <button type="button">Size Chart</button>
              </div>

              <div className="size-options">
                {sizeOptions.map((size, index) => (
                  <button
                    type="button"
                    key={`${size.name}-${index}`}
                    className={selectedSize === size.name ? "active" : ""}
                    onClick={() => handleSizeChange(size)}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =================================================
              PRODUCT NAME
          ================================================= */}

          <div className="brand">
            <h3>
              {selectedProduct.brand ? `${selectedProduct.brand} ` : ""}

              {selectedProduct.title}

              {selectedColor && ` (${selectedColor})`}

              {selectedVariant?.ram && ` (${selectedVariant.ram})`}

              {selectedVariant?.rom && ` (${selectedVariant.rom})`}

              {selectedVariant?.value &&
                !selectedVariant?.ram &&
                ` (${selectedVariant.value})`}

              {selectedSize && (isFashion || isShoes) && ` (${selectedSize})`}
            </h3>
          </div>

          {/* =================================================
              RATING
          ================================================= */}

          <div className="rating-reviews">
            <span className="rating-box">
              <span className="rating-number">{productRating}</span>

              <span className="rating-star">★</span>

              <span className="review-separator">|</span>

              <span className="reviews">{totalRatings}</span>
            </span>
          </div>

          {/* =================================================
              PRICE
          ================================================= */}

          <div className="price-section">
            {currentDiscount !== null && currentDiscount !== undefined && (
              <span className="discount">↓{currentDiscount}%</span>
            )}

            {currentOriginalPrice !== null &&
              currentOriginalPrice !== undefined &&
              currentOriginalPrice !== "" && (
                <span className="old-price">
                  ₹{Number(currentOriginalPrice).toLocaleString("en-IN")}
                </span>
              )}

            <span className="new-price">
              ₹{Number(currentPrice || 0).toLocaleString("en-IN")}
            </span>
          </div>

          {/* =================================================
              SELECTED VARIANT PRICE INFO
          ================================================= */}

          {selectedVariant && (
            <div className="selected-variant-price">
              <span>Selected:</span>

              <strong>{selectedVariant.name}</strong>

              <span>₹{Number(currentPrice || 0).toLocaleString("en-IN")}</span>
            </div>
          )}

          <div className="offer-applied">
            <span className="offer-icon">%</span>

            <span>₹527 off</span>

            <span className="offer-applied-text">applied for you</span>
          </div>

          <p className="protect-fees">+ ₹109 Protect Promise Fee</p>

          {/* =================================================
              DELIVERY
          ================================================= */}

          <div className="delivery-details">
            <h3>Delivery details</h3>

            <div className="delivery-address">
              <span className="address-icon">⌂</span>

              <div className="address-text">
                <strong>HOME</strong>

                {deliveryAddress ? (
                  <span>
                    {deliveryAddress.name}, {deliveryAddress.address},{" "}
                    {deliveryAddress.city}, {deliveryAddress.state} -{" "}
                    {deliveryAddress.pincode}
                  </span>
                ) : (
                  <span>Select delivery address</span>
                )}
              </div>

              <span className="address-arrow">›</span>
            </div>

            <div className="delivery-info">
              <span className="delivery-icon">▣</span>

              <div>
                <strong>Delivery by 18 Aug, Tue</strong>

                <p>Order in 01h 20m 20s</p>
              </div>
            </div>

            <div className="seller-info">
              <span className="seller-icon">▣</span>

              <div>
                <div>
                  Fulfilled by <strong>INDIABUZZZ</strong>
                </div>

                <p>4.8 ★ • 7 years with Flipkart</p>

                <a href="#">See other sellers</a>
              </div>
            </div>
          </div>

          {/* =================================================
              INFORMATION
          ================================================= */}

          <div className="product-info-sections">
            {/* PEACE */}

            <div className="info-section">
              <div
                className="info-header"
                onClick={() => toggleSection("peace")}
              >
                <div>
                  <h2>Shop with peace of mind</h2>

                  <p>Complete care for your purchase</p>
                </div>

                <button type="button" className="arrow-btn">
                  {openSection.peace ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>

              {openSection.peace && (
                <div className="info-content">
                  <div className="warranty-box">
                    <div className="warranty-icon">1+</div>

                    <span>{selectedProduct.warranty || "1 Year Warranty"}</span>
                  </div>

                  <div className="peace-items">
                    <div className="peace-item">
                      <div className="peace-icon">↩</div>

                      <p>
                        10-day
                        <br />
                        Return
                      </p>
                    </div>

                    <div className="peace-item">
                      <div className="peace-icon">₹</div>

                      <p>
                        Secure
                        <br />
                        Payment
                      </p>
                    </div>

                    <div className="peace-item">
                      <div className="peace-icon">✓</div>

                      <p>
                        Quality
                        <br />
                        Assured
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* HIGHLIGHTS */}

            <div className="info-section">
              <div
                className="info-header"
                onClick={() => toggleSection("highlights")}
              >
                <div>
                  <h2>Product highlights</h2>

                  <p>Key product attributes and features</p>
                </div>

                <button type="button" className="arrow-btn">
                  {openSection.highlights ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>

              {openSection.highlights && (
                <div className="highlights-content">
                  {specificationDetails.slice(0, 8).map((detail, index) => (
                    <div className="highlight-row" key={index}>
                      <span>{detail.label}</span>

                      <strong>{detail.value}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ALL DETAILS */}

            <div className="info-section">
              <div
                className="info-header"
                onClick={() => toggleSection("details")}
              >
                <div>
                  <h2>All details</h2>

                  <p>Features, description and more</p>
                </div>

                <button type="button" className="arrow-btn">
                  {openSection.details ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>

              {openSection.details && (
                <div className="all-details-content">
                  <div className="details-tabs">
                    {["Specifications", "Description", "Manufacturer info"].map(
                      (tab) => (
                        <button
                          key={tab}
                          type="button"
                          className={detailsTab === tab ? "active" : ""}
                          onClick={() => setDetailsTab(tab)}
                        >
                          {tab}
                        </button>
                      ),
                    )}
                  </div>

                  {detailsTab === "Specifications" && (
                    <>
                      <h3 className="details-heading">General</h3>

                      <div className="details-grid">
                        {specificationDetails.map((detail, index) => (
                          <div className="detail-item" key={index}>
                            <span>{detail.label}</span>

                            <strong>{detail.value}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {detailsTab === "Description" && (
                    <div className="description-content">
                      <h3>Product Description</h3>

                      <p>
                        {selectedProduct.description ||
                          selectedProduct.otherDetails ||
                          `${selectedProduct.title} is designed to provide a comfortable and reliable experience.`}
                      </p>
                    </div>
                  )}

                  {detailsTab === "Manufacturer info" && (
                    <div className="description-content">
                      <h3>Manufacturer Information</h3>

                      <div className="manufacturer-grid">
                        <div>
                          <span>Brand</span>

                          <strong>
                            {selectedProduct.brand || "Not specified"}
                          </strong>
                        </div>

                        <div>
                          <span>Model</span>

                          <strong>
                            {selectedProduct.model ||
                              selectedProduct.styleCode ||
                              "Not specified"}
                          </strong>
                        </div>

                        <div>
                          <span>Country of Origin</span>

                          <strong>{selectedProduct.country || "India"}</strong>
                        </div>

                        <div>
                          <span>Warranty</span>

                          <strong>
                            {selectedProduct.warranty || "1 Year"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* REVIEWS */}

            <div className="info-section">
              <div
                className="info-header"
                onClick={() => toggleSection("reviews")}
              >
                <div>
                  <h2>Ratings and reviews</h2>

                  <p>Customer ratings and reviews</p>
                </div>

                <button type="button" className="arrow-btn">
                  {openSection.reviews ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>

              {openSection.reviews && (
                <div className="reviews-content">
                  <div className="review-summary">
                    <div className="overall-rating">
                      <div className="overall-rating-number">
                        <strong>{productRating}</strong>

                        <span>★</span>
                      </div>

                      <span className="rating-good">
                        {productRating >= 4.5
                          ? "Excellent"
                          : productRating >= 4
                            ? "Very Good"
                            : "Good"}
                      </span>

                      <p>
                        based on {totalRatings.toLocaleString()} ratings by{" "}
                        <span>ⓥ Verified Buyers</span>
                      </p>
                    </div>

                    <div className="rating-bars">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div className="rating-bar-row" key={rating}>
                          <span>{rating} ★</span>

                          <div className="rating-bar">
                            <div
                              className="rating-fill"
                              style={{
                                width: `${ratingDistribution[rating]}%`,
                              }}
                            />
                          </div>

                          <span>{ratingDistribution[rating]}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="write-review-btn"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    ✍️ Write a review
                  </button>

                  {showReviewForm && (
                    <div className="review-form">
                      <h3>Rate this product</h3>

                      <div className="review-star-selector">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={
                              star <= reviewRating
                                ? "review-star active"
                                : "review-star"
                            }
                            onClick={() => setReviewRating(star)}
                          >
                            ★
                          </button>
                        ))}

                        <span>
                          {reviewRating}
                          /5
                        </span>
                      </div>

                      <textarea
                        className="review-textarea"
                        placeholder="Share your experience with this product..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        maxLength={500}
                      />

                      <div className="review-character-count">
                        {reviewText.length}
                        /500
                      </div>

                      <div className="review-upload-section">
                        <label className="review-upload-btn">
                          <FiCamera />
                          Add photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleReviewImage}
                            hidden
                          />
                        </label>

                        {reviewImage && (
                          <div className="review-image-preview">
                            <img src={reviewImage} alt="Review preview" />

                            <button type="button" onClick={removeReviewImage}>
                              <FiX />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="review-form-actions">
                        <button
                          type="button"
                          className="cancel-review-btn"
                          onClick={() => {
                            setShowReviewForm(false);

                            setReviewText("");

                            setReviewImage(null);
                          }}
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          className="post-review-btn"
                          onClick={handlePostReview}
                        >
                          Post review
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="customer-photos-section">
                    <div className="section-title-row">
                      <h3>Customer photos</h3>

                      {reviewsList.filter((review) => review.image).length >
                        0 && (
                        <span>
                          {reviewsList.filter((review) => review.image).length}{" "}
                          photos
                        </span>
                      )}
                    </div>

                    <div className="customer-photo-grid">
                      {reviewsList
                        .filter((review) => review.image)
                        .slice(0, 5)
                        .map((review) => (
                          <div className="customer-photo" key={review.id}>
                            <img src={review.image} alt="Customer review" />
                          </div>
                        ))}

                      {colorImages.slice(0, 3).map((image, index) => (
                        <div
                          className="customer-photo demo-photo"
                          key={`demo-${index}`}
                        >
                          <img src={image} alt="Product" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="customer-loved">
                    <h3>Features customers loved</h3>

                    <div className="rating-tags">
                      {(
                        selectedProduct.reviewFeatures || [
                          "Quality",
                          "Color",
                          "Style",
                          "Comfort",
                          "Value for Money",
                          "Design",
                        ]
                      ).map((feature, index) => (
                        <span key={index}>{feature}</span>
                      ))}
                    </div>
                  </div>

                  <div className="review-list">
                    {reviewsList.length === 0 && (
                      <div className="no-reviews">
                        <h3>Be the first to review this product</h3>

                        <p>Share your experience with other buyers.</p>
                      </div>
                    )}

                    {reviewsList
                      .slice(0, showAllReviews ? reviewsList.length : 2)
                      .map((review) => (
                        <div className="review-card" key={review.id}>
                          <div className="review-card-top">
                            <div className="review-heading">
                              <span className="review-rating">
                                {review.rating} ★
                              </span>

                              <strong>{getReviewTitle(review.rating)}</strong>
                            </div>

                            <span className="review-date">{review.date}</span>
                          </div>

                          <p className="review-text">{review.text}</p>

                          {review.image && (
                            <div className="review-card-image-wrapper">
                              <img
                                className="review-card-image"
                                src={review.image}
                                alt="Customer review"
                              />
                            </div>
                          )}

                          <div className="review-card-bottom">
                            <div className="review-user">
                              <strong>{review.name}</strong>

                              {review.verified && (
                                <span className="verified-buyer">
                                  ⓥ Verified Buyer
                                </span>
                              )}
                            </div>

                            <div className="review-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  handleReviewVote(review.id, "like")
                                }
                              >
                                <FiThumbsUp />

                                {review.likes || 0}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleReviewVote(review.id, "dislike")
                                }
                              >
                                <FiThumbsDown />

                                {review.dislikes || 0}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {reviewsList.length > 2 && (
                    <button
                      type="button"
                      className="show-all-reviews-btn"
                      onClick={() => setShowAllReviews(!showAllReviews)}
                    >
                      <span>
                        {showAllReviews ? "Show less" : "Show all reviews"}
                      </span>

                      {showAllReviews ? <FiChevronUp /> : <FiChevronRight />}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              BOTTOM BUY BAR
          ================================================= */}

          <div className="bottom-buy-bar">
            <button
              type="button"
              className="Add-cart-btn"
              onClick={handleAddToCart}
              title="Add to cart"
            >
              <FaShoppingCart />
              {added}
            </button>

            <button type="button" className="emi-btn">
              Buy with EMI
              <span>From ₹797/m</span>
            </button>

            <button type="button" className="buy-btns" onClick={handleBuyNow}>
              Buy now
              <span> ₹{Number(currentPrice || 0).toLocaleString("en-IN")}</span>
            </button>
          </div>

          {/* Flipkart-style temporary notification */}
          {added && (
            <div className="cart-added-box">
              <span className="cart-added-text">✓ Item added to cart</span>

              <button
                type="button"
                className="go-cart-btn"
                onClick={() => navigate("/cart")}
              >
                GO TO CART
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductDetails;
