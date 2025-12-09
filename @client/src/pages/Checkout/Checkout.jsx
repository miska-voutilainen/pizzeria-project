import React, { useState } from "react";
import Button from "../../components/ui/Button/Button";
import "./Checkout.css";
import InputField from "../../components/ui/InputField/InputField";
import InputSubmit from "../../components/ui/InputSubmit/InputSubmit";
import TextButton from "../../components/ui/TextButton/TextButton";
import { useCart } from "../../context/CartContext";

// Import payment method images
import mobilepayImg from "../../assets/images/paymentMethods/MobilePay_logo.svg";
import applepayImg from "../../assets/images/paymentMethods/apple-pay-logo-icon.svg";
import googlepayImg from "../../assets/images/paymentMethods/google-pay-logo-icon.svg";
import klarnaImg from "../../assets/images/paymentMethods/Klarna_Payment_Badge.svg";
import cardImg from "../../assets/images/paymentMethods/visa-and-mastercard-logos.svg";

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState("mobilepay");
  const [deliveryType, setDeliveryType] = useState("delivery");
  const { cartItems, getCartTotal } = useCart();

  return (
    <section id="checkout-section">
      <div className="checkout-section-wrapper">
        <div className="checkout-input-col">
          <h1>Checkout</h1>
          <div className="checkout-category-tabs-container">
            <div className="category-tabs">
              <button
                className={deliveryType === "delivery" ? "active" : ""}
                onClick={() => setDeliveryType("delivery")}
              >
                Delivery
              </button>
              <button
                className={deliveryType === "takeaway" ? "active" : ""}
                onClick={() => setDeliveryType("takeaway")}
              >
                Take-away
              </button>
            </div>
          </div>
          <div className="checkout-inputs">
            <div className="checkout-input-row">
              <label htmlFor="name">Nimi</label>
              <InputField
                type="text"
                name={"name"}
                id={"name"}
                placeholder="Etunimi"
              />
            </div>
            <div className="checkout-input-row">
              <label htmlFor="phone-number">Puhelinnumero</label>
              <InputField
                type="tel"
                name={"phone-number"}
                id={"phone-number"}
                placeholder="Puhelinnumero"
              />
            </div>
            <div className="checkout-input-row">
              <label htmlFor="delivry-address">Toimitusosoite</label>
              <InputField
                type="text"
                name={"delivry-address"}
                id={"delivry-address"}
                placeholder="Toimitussosoite"
              />
            </div>
            <div className="checkout-input-row">
              <label htmlFor="postcode">Postinumero</label>
              <InputField
                type="text"
                name={"postcode"}
                id={"postcode"}
                placeholder="Postinumero"
              />
            </div>
            <div className="checkout-input-row">
              <label htmlFor="region">Kunta</label>
              <InputField
                type="text"
                name={"region"}
                id={"region"}
                placeholder="Kunta"
              />
            </div>
            <div className="checkout-inputs-user-sign-in">
              <TextButton text={"Kirjaudu tai luo tili"} />
            </div>
          </div>
          <div className="promocode-container">
            <h2>Alennuskoodi</h2>
            <div>
              <InputSubmit
                placeholder={"john.smith@gmail.com"}
                type={"email"}
                id={"email"}
                name={"email"}
                submitText={"Apply"}
                appearance={"light"}
              />
            </div>
          </div>
          <div className="checkout-payment-methods-container">
            <div className="checkout-payment-methods-container-wrapper">
              <h2>Payment methods</h2>
              <form className="checkout-payment-method-form">
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mobilepay"
                    checked={paymentMethod === "mobilepay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <img src={mobilepayImg} alt="MobilePay" />
                  MobilePay
                </label>

                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="applepay"
                    checked={paymentMethod === "applepay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <img src={applepayImg} alt="Apple Pay" />
                  Apple Pay
                </label>

                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="googlepay"
                    checked={paymentMethod === "googlepay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <img src={googlepayImg} alt="Google Pay" />
                  Google Pay
                </label>

                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="klarna"
                    checked={paymentMethod === "klarna"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <img src={klarnaImg} alt="Klarna" />
                  Klarna
                </label>

                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <img src={cardImg} alt="Credit/Debit Card" />
                  Credit/Debit Card
                </label>
              </form>
            </div>
          </div>

          <div className="checkout-pay-now-container">
            <Button
              url={"/order-confirmation"}
              text={"Maksa"}
              id={"place-order-button"}
            />
          </div>
        </div>

        <div className="checkout-orders-col">
          <div className="checkout-orders-wrapper">
            <div className="checkout-orders-top-col">
              <h2>Order Items</h2>

              <div className="checkout-order-items">
                {cartItems.map((item) => (
                  <div key={item.slug} className="checkout-order-item">
                    <div className="checkout-order-item-img-container">
                      <img src={item.imgUrl} alt={item.name} />
                    </div>
                    <div className="checkout-order-item-details">
                      <div>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                      </div>
                      <div className="checkout-order-item-details-price-col">
                        <p className="checkout-order-item-details-price">
                          {(item.price * item.quantity).toFixed(2)} €
                        </p>
                        <p className="checkout-order-item-details-qty">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="checkout-orders-footer">
              <div className="checkout-orders-footer-wrapper">
                <div className="checkout-orders-footer-text-item">
                  <p>
                    <span>
                      {cartItems.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}{" "}
                      items
                    </span>
                    <span>{getCartTotal().toFixed(2)} €</span>
                  </p>
                </div>
                <div className="checkout-orders-footer-text-item">
                  <p>Code</p>
                </div>
                <div className="checkout-orders-footer-text-item">
                  <p>
                    <span>Delivery</span> <span>Free</span>
                  </p>
                </div>
                <div className="checkout-orders-footer-text-item">
                  <h3>
                    <span>Order summary</span>
                    <span>{getCartTotal().toFixed(2)} €</span>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
