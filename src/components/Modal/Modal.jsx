import "./Modal.css";
import closeIcon from "../../assets/images/close-x-icon.svg";

export default function Modal({
  isOpen,
  onClose,
  children,
  size = "medium",
  title,
  showCloseButton = true,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-background-overlay" onClick={onClose}>
      <dialog open id="modal-container" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}>
          <img src={closeIcon} alt="close icon" />
        </button>
        {children}
      </dialog>
    </div>
  );
}
