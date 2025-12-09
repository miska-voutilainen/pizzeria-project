import "./EditProductModal.css";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";

const EditProductModal = ({
  isOpen,
  onClose,
  product,
  form,
  setForm,
  save,
  remove,
}) => {
  // Helper function to generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
      .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  };

  if (!isOpen) return null;

  const handleRemove = () => {
    if (confirm("Are you sure you want to delete this product?")) {
      remove(product.slug);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      title="Muokkaa tuotetta"
    >
      <div className="product-modal-wrapper">
        <div className="product-modal-img-input-col form-field">
          <label htmlFor="url">
            Image URL <span className="required-indicator">*</span>
          </label>
          <div className="product-modal-preview-wrapper">
            <div className="product-modal-image-preview-container">
              {/* Image Preview */}
              {form.imgUrl ? (
                <div>
                  <img
                    src={form.imgUrl}
                    alt="Product preview"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                    onLoad={(e) => {
                      e.target.style.display = "block";
                      e.target.nextSibling.style.display = "none";
                    }}
                  />
                  <div>Invalid image URL or image failed to load</div>
                </div>
              ) : (
                <p>Preview</p>
              )}
            </div>
            <input
              placeholder="Image URL"
              value={form.imgUrl}
              onChange={(e) => setForm({ ...form, imgUrl: e.target.value })}
              name="url"
              id="url"
              required
            />
          </div>
        </div>

        <div className="product-modal-text-inputs-col">
          <div className="form-field">
            <label htmlFor="name">
              Nimi <span className="required-indicator">*</span>
            </label>
            <input
              id="name"
              placeholder="Syötä tuotteen nimi"
              value={form.name}
              onChange={(e) => {
                const newName = e.target.value;
                setForm({
                  ...form,
                  name: newName,
                  slug: generateSlug(newName),
                });
              }}
              name="name"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="slug">Slug (automaattisesti luotu)</label>
            <input
              id="slug"
              placeholder="tuote-slug-url"
              name="slug"
              value={form.slug}
              readOnly
              style={{
                backgroundColor: "#f8f9fa",
                cursor: "not-allowed",
                color: "#6c757d",
              }}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="categories">Kategoriat</label>
            <select
              name="categories"
              id="categories"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="drinks">drinks</option>
              <option value="pizza">pizza</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="price">
              Hinta <span className="required-indicator">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="description">
              Kuvaus <span className="required-indicator">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Kirjoita tuotteen kuvaus"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>
        </div>
      </div>
      <div className="product-modal-buttons">
        <button onClick={handleRemove} className="product-modal-delete-button">
          Poista
        </button>
        <Button onClick={save} text={"Tallenna"} type={"add"} />
      </div>
    </Modal>
  );
};

export default EditProductModal;
