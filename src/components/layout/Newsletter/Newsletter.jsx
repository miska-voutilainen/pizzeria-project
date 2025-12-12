import React, { useState } from "react";
import "./Newsletter.css";

import image from "../../../assets/images/newsletter-image.jpg";
import InputSubmit from "../../ui/InputSubmit/InputSubmit";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validation
    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/newsletter/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to subscribe");
        return;
      }

      setMessage("Success! Check your email for your coupon code.");
      setEmail("");
      setAgreeTerms(false);
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter">
      <div className="newsletter-wrapper">
        <div className="newsletter-image-container">
          <img
            src="src/assets/images/newsletter-sale-vector.svg"
            alt="save-vector"
            className="newsletter-sale-vector"
          />
          <img
            className="newsletter-image"
            src={image}
            alt="newsletter-image"
          />
        </div>

        <div className="newsletter-inputs-container">
          <h1>Subscribe and get 10% off!*</h1>
          <ul>
            <li>10% off your first order!</li>
            <li>Weekly discounts!</li>
          </ul>
          <form className="newsletter-inputs" onSubmit={handleSubmit}>
            <label htmlFor="email">
              <span>* </span>
              <a
                style={{ color: "white" }}
                href="/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
              >
                T & C's apply
              </a>
            </label>
            {/* commented out for new component below */}
            {/* <div className="newsletter-inputs-email">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="john.smith@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Submit"}
              </button>
            </div> */}
            <InputSubmit
              value={email}
              setValue={setEmail}
              loading={loading}
              placeholder={"john.smith@gmail.com"}
              type={"email"}
              id={"email"}
              name={"email"}
              submitText={"Submit"}
              appearance={"dark"}
            />
            <div className="newsletter-inputs-accept-terms">
              <input
                type="checkbox"
                id="accept-terms"
                name="accept-terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="accept-terms">Accept terms</label>
            </div>
            {error && (
              <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
            )}
            {message && (
              <p style={{ color: "green", marginTop: "10px" }}>{message}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
