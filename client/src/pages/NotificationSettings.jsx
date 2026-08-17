import React, { useState } from "react";
import "./NotificationSettings.css";

const NotificationSettings = () => {

  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(true);
  const [offer, setOffer] = useState(true);

  return (
    <div className="notification-page">

      <h2>Notification Settings</h2>

      <div className="notification-box">

        <div>
          <h4>Email Notifications</h4>
          <p>Order updates and offers via email</p>
        </div>

        <input
          type="checkbox"
          checked={email}
          onChange={()=>setEmail(!email)}
        />

      </div>


      <div className="notification-box">

        <div>
          <h4>SMS Notifications</h4>
          <p>Delivery and payment alerts</p>
        </div>

        <input
          type="checkbox"
          checked={sms}
          onChange={()=>setSms(!sms)}
        />

      </div>


      <div className="notification-box">

        <div>
          <h4>Offers & Deals</h4>
          <p>Latest discounts and sales</p>
        </div>

        <input
          type="checkbox"
          checked={offer}
          onChange={()=>setOffer(!offer)}
        />

      </div>

    </div>
  );
};

export default NotificationSettings;