import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(
  __dirname,
  "../src/data/Product.js"
);

const outputFile = path.join(
  __dirname,
  "../src/data/Product.cloudinary.js"
);

// --------------------------------------------------
// Cloudinary upload
// --------------------------------------------------

async function uploadImage(imageUrl, folder) {
  if (!imageUrl || typeof imageUrl !== "string") {
    return imageUrl;
  }

  // Local image hai to skip
  if (!imageUrl.startsWith("http")) {
    return imageUrl;
  }

  try {
    console.log(`Uploading: ${imageUrl}`);

    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: `ApnaBazarKart/${folder}`,
      resource_type: "image",
    });

    console.log(`✅ Uploaded: ${result.secure_url}`);

    return result.secure_url;
  } catch (error) {
    console.log(`❌ Failed: ${imageUrl}`);
    console.log(error.message);

    // Agar upload fail ho to original URL hi rakho
    return imageUrl;
  }
}

// --------------------------------------------------
// Main function
// --------------------------------------------------

async function processProducts(products) {
  for (const product of products) {
    console.log("\n================================");
    console.log(`Product: ${product.title}`);
    console.log("================================");

    // -----------------------------------------------
    // 1. product.image
    // -----------------------------------------------

    if (product.image) {
      product.image = await uploadImage(
        product.image,
        `products/${product.id}`
      );
    }

    // -----------------------------------------------
    // 2. product.thumbnails[]
    // -----------------------------------------------

    if (Array.isArray(product.thumbnails)) {
      for (let i = 0; i < product.thumbnails.length; i++) {
        if (product.thumbnails[i]) {
          product.thumbnails[i] = await uploadImage(
            product.thumbnails[i],
            `products/${product.id}/thumbnails`
          );
        }
      }
    }

    // -----------------------------------------------
    // 3. product.colors[].image
    // -----------------------------------------------

    if (Array.isArray(product.colors)) {
      for (const color of product.colors) {
        if (color.image) {
          color.image = await uploadImage(
            color.image,
            `products/${product.id}/colors/${color.name}`
          );
        }

        // -------------------------------------------
        // 4. product.colors[].thumbnails[]
        // -------------------------------------------

        if (Array.isArray(color.thumbnails)) {
          for (let i = 0; i < color.thumbnails.length; i++) {
            if (color.thumbnails[i]) {
              color.thumbnails[i] = await uploadImage(
                color.thumbnails[i],
                `products/${product.id}/colors/${color.name}/thumbnails`
              );
            }
          }
        }
      }
    }
  }

  return products;
}

// --------------------------------------------------
// Product.js read karna
// --------------------------------------------------

async function main() {
  try {
    console.log("Reading Product.js...");

    const fileContent = fs.readFileSync(
      inputFile,
      "utf8"
    );

    /*
      IMPORTANT:
      Product.js mein normally:
      
      const products = [
        {...},
        {...}
      ];

      export default products;
    */

    const match = fileContent.match(
      /const\s+products\s*=\s*(\[[\s\S]*\]);?\s*export\s+default/
    );

    if (!match) {
      throw new Error(
        "Product.js mein 'const products = [...]' format nahi mila."
      );
    }

    const products = eval(match[1]);

    console.log(`Found ${products.length} products`);

    const updatedProducts = await processProducts(
      products
    );

    const outputContent = `const products = ${JSON.stringify(
      updatedProducts,
      null,
      2
    )};

export default products;
`;

    fs.writeFileSync(
      outputFile,
      outputContent,
      "utf8"
    );

    console.log("\n================================");
    console.log("🎉 DONE!");
    console.log(`Saved to: ${outputFile}`);
    console.log("================================");
  } catch (error) {
    console.error("\n❌ ERROR:");
    console.error(error);
  }
}

main();