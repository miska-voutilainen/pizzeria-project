import "./InputSubmit.css";

const InputSubmit = ({
  value,
  setValue,
  loading,
  placeholder,
  type,
  id,
  name,
  submitText,
  appearance = "dark",
  submitStyle,
}) => {
  return (
    <div className={`input-submit-container ${appearance}`}>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={loading}
      />
      <button
        className={`input-submit-button ${
          submitStyle ? `input-submit-button-${submitStyle}` : ""
        }`}
        type="submit"
        disabled={loading}
      >
        {loading ? "Sending..." : submitText}
      </button>
    </div>
  );
};

export default InputSubmit;
