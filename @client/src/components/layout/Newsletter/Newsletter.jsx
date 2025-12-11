import React, { useState } from "react";
import useLanguage from "../../../context/useLanguage.jsx";
import "./Newsletter.css";

import image from "../../../assets/images/newsletter-image.jpg";
import InputSubmit from "../../ui/InputSubmit/InputSubmit";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validation
    if (!email.trim()) {
      setError(t("newsletter.errors.enterEmail"));
      return;
    }

    if (!agreeTerms) {
      setError(t("newsletter.errors.acceptTerms"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3001/api/newsletter/subscribe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t("newsletter.errors.failed"));
        return;
      }

      setMessage(t("newsletter.successMessage"));
      setEmail("");
      setAgreeTerms(false);
    } catch (err) {
      setError(t("newsletter.errors.server"));
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
          <h1>{t("newsletter.title")}</h1>
          <ul>
            <li>
              <span>{t("newsletter.benefit1")}</span>
            </li>
            <li>
              <span>{t("newsletter.benefit2")}</span>
            </li>
          </ul>
          <form className="newsletter-inputs" onSubmit={handleSubmit}>
            <label htmlFor="email">{t("newsletter.termsLabel")}</label>
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
              placeholder={t("newsletter.placeholder")}
              type={"email"}
              id={"email"}
              name={"email"}
              submitText={t("common.submit")}
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
              <label htmlFor="accept-terms">
                {t("newsletter.acceptTerms")}
              </label>
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
