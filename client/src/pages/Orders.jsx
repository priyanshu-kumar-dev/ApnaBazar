import React from "react";
import "./Orders.css";

const Orders = () => {

  // Demo Orders
  const orders = [
    {
      id: 1,
      title: "Apple iPhone 16",
      image: "https://picsum.photos/120?random=1",
      price: 79999,
      status: "Delivered",
      date: "18 July 2026",
    },
    {
      id: 2,
      title: "Sony WH-1000XM5 Headphones",
      image: "https://picsum.photos/120?random=2",
      price: 24999,
      status: "Out for Delivery",
      date: "19 July 2026",
    },
    {
      id: 3,
      title: "Nike Air Max",
      image: "https://picsum.photos/120?random=3",
      price: 5999,
      status: "Processing",
      date: "20 July 2026",
    },
  ];

  return (
    <div className="orders-page">

      <h2>My Orders</h2>

      {orders.length === 0 ? (

        <div className="empty-orders">

          <h3>No Orders Found</h3>

          <p>You haven't placed any orders yet.</p>

        </div>

      ) : (

        orders.map((order) => (

          <div className="order-card" key={order.id}>

            <img
              src={order.image}
              alt={order.title}
            />

            <div className="order-details">

              <h3>{order.title}</h3>

              <p>₹{order.price}</p>

              <span className={`status ${order.status.toLowerCase().replace(/ /g,"-")}`}>
                {order.status}
              </span>

              <p className="date">
                Ordered on {order.date}
              </p>

            </div>

          </div>

        ))

      )}

    </div>
  );
};

export default Orders;