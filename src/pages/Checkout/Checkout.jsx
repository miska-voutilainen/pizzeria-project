import React, { useState } from "react";
import Button from "../../components/ui/Button/Button";
import "./Checkout.css";
import InputField from "../../components/ui/InputField/InputField";
import InputSubmit from "../../components/ui/InputSubmit/InputSubmit";
import TextButton from "../../components/ui/TextButton/TextButton";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../components/Modal/Modal/Modal";

// Import payment method images
import mobilepayImg from "../../assets/images/paymentMethods/MobilePay_logo.svg";
import applepayImg from "../../assets/images/paymentMethods/apple-pay-logo-icon.svg";
import googlepayImg from "../../assets/images/paymentMethods/google-pay-logo-icon.svg";
import klarnaImg from "../../assets/images/paymentMethods/Klarna_Payment_Badge.svg";
import cardImg from "../../assets/images/paymentMethods/visa-and-mastercard-logos.svg";
import RadioButton from "../../components/ui/RadioButton/RadioButton";
import CheckoutNavigationBar from "../../components/layout/Navigation/CheckoutNavigationBar/CheckoutNavigationBar";

const Checkout = () => {
  const navigate = useNavigate();
  const signInRef = React.useRef(null);
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

  const openModal = () => {
    document.body.style.overflow = "hidden";
    signInRef.current.showModal();
  };

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

    console.log("Place order clicked!");
    console.log("Form data:", formData);
    console.log("Delivery type:", deliveryType);

    // Validate required fields
    if (!formData.name || !formData.phone) {
      console.log("Validation failed: missing name or phone");
      alert("Please fill in name and phone number");
      return;
    }

    if (
      deliveryType === "delivery" &&
      (!formData.address || !formData.postcode || !formData.city)
    ) {
      console.log("Validation failed: missing delivery address fields");
      alert("Please fill in all delivery address fields");
      return;
    }

    console.log("Validation passed, proceeding with order...");

    try {
      // Only send essential item data
      const orderItems = cartItems.map((item) => {
        // For custom pizzas — send full details
        if (item.isCustom) {
          return {
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size || null,
            base: item.base || null,
            ingredients: item.ingredients || null,
            isCustom: true,
          };
        }

        // For regular menu items — keep it simple
        return {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        };
      });

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

      console.log("Sending order data:", orderData);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(orderData),
        }
      );

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response result:", result);

      if (result.success) {
        console.log(
          "Order successful, navigating to:",
          `/order-confirmation?orderId=${result.orderId}`
        );

        // Force navigation by using window.location as backup
        try {
          navigate(`/order-confirmation?orderId=${result.orderId}`, {
            replace: true,
          });
          console.log("Navigation called successfully");
        } catch (navError) {
          console.error("Navigation failed, using window.location:", navError);
          window.location.href = `/order-confirmation?orderId=${result.orderId}`;
        }

        // Clear cart after a delay to ensure navigation happens first
        setTimeout(() => {
          clearCart();
          console.log("Cart cleared");
        }, 500);
      } else {
        console.log("Order failed:", result.error);
        alert("Error creating order: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order. Please try again.");
    }
  };

  return (
    <>
      <CheckoutNavigationBar />
      <section id="checkout-section">
        <div className="checkout-section-wrapper">
          <div className="checkout-input-col">
            <h1>Checkout</h1>
            <div className="checkout-category-tabs-container">
              <div className="category-tabs">
                {/* <button
                    className={deliveryType === "delivery" ? "active" : ""}
                    onClick={() => setDeliveryType("delivery")}
                  >
                    Delivery
                  </button> */}
                <RadioButton
                  text={"Delivery"}
                  onClick={() => setDeliveryType("delivery")}
                  active={deliveryType === "delivery"}
                />
                <RadioButton
                  text={"Take-away"}
                  onClick={() => setDeliveryType("takeaway")}
                  active={deliveryType === "takeaway"}
                />
                {/* <button
                    className={deliveryType === "takeaway" ? "active" : ""}
                    onClick={() => setDeliveryType("takeaway")}
                  >
                    Take-away
                  </button> */}
              </div>
            </div>
            <div className="checkout-inputs">
              <div className="checkout-input-row">
                <label htmlFor="name">Name</label>
                <InputField
                  type="text"
                  name={"name"}
                  id={"name"}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleFormChange("name")}
                />
              </div>
              <div className="checkout-input-row">
                <label htmlFor="phone">Phone number</label>
                <InputField
                  type="tel"
                  name={"phone"}
                  id={"phone"}
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleFormChange("phone")}
                />
              </div>
              {deliveryType === "delivery" && (
                <>
                  <div className="checkout-input-row">
                    <label htmlFor="address">Delivery address</label>
                    <InputField
                      type="text"
                      name={"address"}
                      id={"address"}
                      placeholder="Delivery address"
                      value={formData.address}
                      onChange={handleFormChange("address")}
                    />
                  </div>
                  <div className="checkout-input-row">
                    <label htmlFor="postcode">Postal code</label>
                    <InputField
                      type="text"
                      name={"postcode"}
                      id={"postcode"}
                      placeholder="Postal code"
                      value={formData.postcode}
                      onChange={handleFormChange("postcode")}
                    />
                  </div>
                  <div className="checkout-input-row">
                    <label htmlFor="city">City</label>
                    <InputField
                      type="text"
                      name={"city"}
                      id={"city"}
                      placeholder="City"
                      value={formData.city}
                      onChange={handleFormChange("city")}
                    />
                  </div>
                </>
              )}
              {deliveryType === "takeaway" && (
                <div className="checkout-input-row">
                  <label htmlFor="pizzeria-address">Pizzeria address</label>
                  <InputField
                    type="text"
                    name={"pizzeria-address"}
                    id={"pizzeria-address"}
                    placeholder="Pizzeria address"
                    value="Kauppakatu 123, 00100 Helsinki"
                    readOnly
                  />
                </div>
              )}
              {deliveryType !== "delivery" && (
                <TextButton text={"Select pizzeria"} />
              )}
              <div className="checkout-inputs-user-sign-in">
                {!user && (
                  <TextButton
                    text={"Sign in or create an account"}
                    onClick={() => setModalWindow("SignIn")}
                  />
                )}
              </div>
            </div>
            <div className="promocode-container">
              <h2>Coupon code</h2>
              <form onSubmit={handleApplyCoupon}>
                <InputSubmit
                  placeholder={"Enter discount code"}
                  type={"text"}
                  id={"email"}
                  name={"email"}
                  submitText={"Apply"}
                  appearance={"light"}
                  value={couponInput}
                  setValue={setCouponInput}
                  submitStyle="wide"
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
                text={"Place Order"}
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
                        <span>Discount ({couponPercentage}%)</span>
                        <span>
                          -
                          {((getCartTotal() * couponPercentage) / 100).toFixed(
                            2
                          )}
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
      <Modal ref={signInRef} redirectPath="/checkout" />
    </>
  );
};

export default Checkout;
