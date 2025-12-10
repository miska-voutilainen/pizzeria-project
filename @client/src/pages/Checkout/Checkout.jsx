import React, { useState } from "react";
import InputField from "../../components/ui/inputField/InputField";
import Button from "../../components/ui/Button/Button";
import "./Checkout.css";

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState("mobilepay");

  return (
    <section id="checkout-section">
      <div className="checkout-section-wrapper">
        <div className="checkout-input-col">
          <h1>Checkout</h1>
          <div>
            <div className="category-tabs">
              <button>Delivery</button>
              <button>Takeout</button>
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
          </div>
          <div className="promocode-container">
            <h2>Alennuskoodi</h2>
            <div>
              <div className="newsletter-inputs-email">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john.smith@gmail.com"
                />
                <button type="submit">Submit</button>
              </div>
            </div>
          </div>
          <div>
            <h2>Payment methods</h2>
            <form>
              <h3>Select Payment Method</h3>

              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mobilepay"
                  checked={paymentMethod === "mobilepay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                MobilePay
              </label>
              <br />

              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="applepay"
                  checked={paymentMethod === "applepay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Apple Pay
              </label>
              <br />

              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="googlepay"
                  checked={paymentMethod === "googlepay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Google Pay
              </label>
              <br />

              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="klarna"
                  checked={paymentMethod === "klarna"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Klarna
              </label>
              <br />

              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Credit/Debit Card
              </label>
              <br />
            </form>
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
            <h2>Order Items</h2>
            <div className="checkout-order-items">
              <div className="checkout-order-item">
                <div>
                  <img src="" alt="pizza" />
                </div>
                <div>
                  <div>
                    <h3>Name</h3>
                    <p>Description</p>
                  </div>
                  <div>
                    <p>price €</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="checkout-orders-footer">
              <div>
                <p># items</p>
              </div>
              <div>
                <p>Code</p>
              </div>
              <div>
                <p>Delivery</p>
              </div>
              <div>
                <p>Order summary</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
