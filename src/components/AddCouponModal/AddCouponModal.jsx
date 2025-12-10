import "./AddCouponModal.css";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";

const AddCouponModal = ({ isOpen, onClose, form, setForm, save, editing }) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Muokkaa kuponkia" : "Lisää uusi kuponki"}
    >
      <div className="coupon-modal-wrapper">
        <div className="coupon-form-group">
          <label htmlFor="code">
            Koodi <span className="required-indicator">*</span>
          </label>
          <input
            id="code"
            type="text"
            placeholder="Syötä kuponkin koodi"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
        </div>

        <div className="coupon-form-group">
          <label htmlFor="discountPercentage">Alennus %</label>
          <input
            id="discountPercentage"
            type="number"
            step="0.01"
            placeholder="Esim. 10"
            value={form.discountPercentage}
            onChange={(e) =>
              setForm({ ...form, discountPercentage: e.target.value })
            }
          />
        </div>

        <div className="coupon-form-group">
          <label htmlFor="expiryDate">Voimassa saakka</label>
          <input
            id="expiryDate"
            type="datetime-local"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />
        </div>

        <div className="coupon-modal-actions">
          <Button
            onClick={save}
            text={editing ? "Päivitä" : "Lisää kuponki"}
            style="primary"
          />
          {/* <Button onClick={onClose} text="Peruuta" style="secondary" /> */}
        </div>
      </div>
    </Modal>
  );
};

export default AddCouponModal;
