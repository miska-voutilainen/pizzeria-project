import styles from "./RadioButton.module.css";

// The active prop is a boolean that applies an active CSS class to visually
// indicate the currently selected option. The parent should pass
// active={currentSelection === thisOption} so the button reflects selection.
const RadioButton = ({ text, onClick, active }) => {
  const className = active ? (styles.active ? styles.active : "active") : "";

  return (
    <button
      type="button"
      className={`${styles["radio-button"]} ${className}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {text}
    </button>
  );
};

export default RadioButton;
