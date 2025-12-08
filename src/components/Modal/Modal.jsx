import "./Modal.css";
import closeIcon from "../../assets/images/close-x-icon.svg";

export default function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  // const handleBackdropClick = (e) => {
  //   if (e.target === e.currentTarget) {
  //     onClose();
  //   }
  // };

  return (
    <div className="modal-background-overlay" onClick={onClose}>
      <dialog open id="dialog-container" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="dialog-title-container">
            <h2 className="modal-title">{title}</h2>
          </div>
        )}
        <button onClick={onClose} className="modal-close-button">
          <img src={closeIcon} alt="close icon" />
        </button>

        {children}
      </dialog>
    </div>
  );
}
