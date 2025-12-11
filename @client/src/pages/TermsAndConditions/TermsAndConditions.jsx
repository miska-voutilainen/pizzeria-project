import "./TermsAndConditions.css";
import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="terms-and-conditions-container">
      <h1>Newsletter Terms & Conditions</h1>
      <p>
        By subscribing to the Pizzeria Web's newsletter, you agree to the
        following terms:
      </p>
      <ul>
        <li>
          Upon successful subscription you will immediately receive a 10%
          discount code valid for 30 days from the moment of registration and
          redeemable only once.
        </li>
        <li>
          The discount applies to the entire order amount (delivery fee
          excluded) and cannot be combined with other offers.
        </li>
        <li>
          You will receive approximately one email per week containing special
          offers, new menu items, campaigns and pizzeria news.
        </li>
        <li>
          You can unsubscribe at any time by clicking the “Unsubscribe” link at
          the bottom of any newsletter. Unsubscription takes effect immediately.
        </li>
        <li>
          We will never sell or share your email address with third parties for
          marketing purposes.
        </li>
        <li>
          We reserve the right to modify the newsletter content, frequency or
          discount terms at any time without prior notice.
        </li>
        <li>The discount code is personal and non-transferable.</li>
      </ul>
      <p>By subscribing you accept these terms and our privacy policy.</p>
    </div>
  );
};

export default TermsAndConditions;
