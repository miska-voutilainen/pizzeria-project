import React, { useState } from "react";
import Button from "../../components/ui/Button/Button";
import "./Checkout.css";
import InputField from "../../components/ui/InputField/InputField";
import InputSubmit from "../../components/ui/InputSubmit/InputSubmit";
import TextButton from "../../components/ui/TextButton/TextButton";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Import payment method images
import mobilepayImg from "../../assets/images/paymentMethods/MobilePay_logo.svg";
import applepayImg from "../../assets/images/paymentMethods/apple-pay-logo-icon.svg";
import googlepayImg from "../../assets/images/paymentMethods/google-pay-logo-icon.svg";
import klarnaImg from "../../assets/images/paymentMethods/Klarna_Payment_Badge.svg";
import cardImg from "../../assets/images/paymentMethods/visa-and-mastercard-logos.svg";

const Checkout = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("mobilepay");
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [couponInput, setCouponInput] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    postcode: "",
    city: "",
  });
  const { user } = useAuth();
  const {
    cartItems,
    getCartTotal,
    applyCoupon,
    removeCoupon,
    coupon,
    couponPercentage,
    getDiscountedTotal,
    clearCart,
  } = useCart();

  const handleFormChange = (fieldName) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    // Remove old coupon if one exists
    if (coupon) {
      removeCoupon();
    }

    const result = await applyCoupon(couponInput);
    if (result.success) {
      setCouponInput("");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.phone) {
      alert("Please fill in name and phone number");
      return;
    }

    if (
      deliveryType === "delivery" &&
      (!formData.address || !formData.postcode || !formData.city)
    ) {
      alert("Please fill in all delivery address fields");
      return;
    }

    try {
      // Only send essential item data
      const orderItems = cartItems.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const orderData = {
        items: orderItems,
        totalAmount:
          coupon && couponPercentage > 0
            ? getDiscountedTotal()
            : getCartTotal(),
        paymentMethod,
        deliveryType,
        shippingAddress:
          deliveryType === "delivery"
            ? {
                street: formData.address,
                postalCode: formData.postcode,
                city: formData.city,
              }
            : null,
        customerName: formData.name,
        customerPhone: formData.phone,
        couponApplied: coupon || null,
        discountAmount:
          coupon && couponPercentage > 0
            ? (getCartTotal() * couponPercentage) / 100
            : 0,
      };

      const response = await fetch("http://localhost:3001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        clearCart();
        navigate(`/order-confirmation?orderId=${result.orderId}`);
      } else {
        alert("Error creating order: " + result.error);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order. Please try again.");
    }
  };

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
                value={formData.name}
                onChange={handleFormChange("name")}
              />
            </div>
            <div className="checkout-input-row">
              <label htmlFor="phone">Puhelinnumero</label>
              <InputField
                type="tel"
                name={"phone"}
                id={"phone"}
                placeholder="Puhelinnumero"
                value={formData.phone}
                onChange={handleFormChange("phone")}
              />
            </div>
<<<<<<< HEAD
            {deliveryType === "delivery" && (
              <>
                <div className="checkout-input-row">
                  <label htmlFor="address">Toimitusosoite</label>
                  <InputField
                    type="text"
                    name={"address"}
                    id={"address"}
                    placeholder="Toimitussosoite"
                    value={formData.address}
                    onChange={handleFormChange("address")}
                  />
                </div>
                <div className="checkout-input-row">
                  <label htmlFor="postcode">Postinumero</label>
                  <InputField
                    type="text"
                    name={"postcode"}
                    id={"postcode"}
                    placeholder="Postinumero"
                    value={formData.postcode}
                    onChange={handleFormChange("postcode")}
                  />
                </div>
                <div className="checkout-input-row">
                  <label htmlFor="city">Kaupunki</label>
                  <InputField
                    type="text"
                    name={"city"}
                    id={"city"}
                    placeholder="Kaupunki"
                    value={formData.city}
                    onChange={handleFormChange("city")}
                  />
                </div>
              </>
            )}
            <div className="checkout-inputs-user-sign-in">
              {!user && <TextButton text={"Kirjaudu tai luo tili"} />}
            </div>
          </div>
          <div className="promocode-container">
            <h2>Alennuskoodi</h2>
            <form onSubmit={handleApplyCoupon}>
              <InputSubmit
                placeholder={"Enter discount code"}
                type={"text"}
                id={"email"}
                name={"email"}
                submitText={"Apply"}
                appearance={"light"}
                value={coupon || couponInput}
                setValue={setCouponInput}
              />
            </form>
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
              onClick={handlePlaceOrder}
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
                {coupon && couponPercentage > 0 && (
                  <div className="checkout-orders-footer-text-item">
                    <p>
                      <span>Alennus ({couponPercentage}%)</span>
                      <span>
                        -
                        {((getCartTotal() * couponPercentage) / 100).toFixed(2)}
                        €
                      </span>
                    </p>
                  </div>
                )}
                <div className="checkout-orders-footer-text-item">
                  <p>
                    <span>Delivery</span> <span>Free</span>
                  </p>
                </div>
                <div className="checkout-orders-footer-text-item">
                  <h3>
                    <span>Order summary</span>
                    <span>
                      {(coupon && couponPercentage > 0
                        ? getDiscountedTotal()
                        : getCartTotal()
                      ).toFixed(2)}{" "}
                      €
                    </span>
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
