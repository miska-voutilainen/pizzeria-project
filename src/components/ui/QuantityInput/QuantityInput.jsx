import styles from "./QuantityInput.module.css";

const QuantityInput = ({ quantity, onIncrease, onDecrease }) => {
  return (
    <div className={styles["quantity-input"]}>
      <button
        onClick={onDecrease}
        className={styles["quantity-btn"]}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className={styles["quantity-text"]}>{quantity}</span>
      <button
        onClick={onIncrease}
        className={styles["quantity-btn"]}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

export default QuantityInput;
