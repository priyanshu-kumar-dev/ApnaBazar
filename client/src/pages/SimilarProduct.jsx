import "./SimilarProduct.css";
import { useParams, useNavigate } from "react-router-dom";
import products from "../data/Product";
import forYouProducts from "../data/ForYouProduct";

function SimilarProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const allProducts = [...products, ...forYouProducts];

  const currentProduct = allProducts.find(
    (item) => String(item.id) === String(id),
  );

  if (!currentProduct) {
    return <h2>Product Not Found</h2>;
  }

  const similarProducts = allProducts.filter(
    (item) =>
      item.category === currentProduct.category &&
      String(item.id) !== String(id),
  );

  return (
    <div className="product-details-page">
      <h2>More {currentProduct.category}</h2>

      <div className="pd-grid">
        {similarProducts.map((item) => (
          <div
            key={item.id}
            className="pd-card"
            onClick={() => navigate(`/product/${item.id}`)}
          >
            <div className="pd-image">
              <img src={item.image} alt={item.title} />
            </div>

            <div className="pd-info">
              <h3>{item.title}</h3>
              <div className="similar-row">
                <span className="similar-discount">↓{item.discount}%</span>
                <span className="similar-price">₹{item.originalPrice}</span>
                <p>₹{item.price}</p>
              </div>
              <span>★★★★</span>
              <b className="star">★ </b>
              <b>{item.rating}</b>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SimilarProduct;
