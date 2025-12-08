import "./AddProductModal.css";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";

const AddProductModal = ({
  isOpen,
  onClose,
  products,
  form,
  setForm,
  editing,
  setEditing,
  save,
  startEdit,
  remove,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large" title="Lisää tuote">
      <div className="product-modal-wrapper">
        <div className="product-modal-img-input-col form-field">
          <label htmlFor="url">Image URL</label>
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
            />
          </div>
        </div>

        <div className="product-modal-text-inputs-col">
          <div className="form-field">
            <label htmlFor="name">Nimi</label>
            <input
              id="name"
              placeholder="Syötä tuotteen nimi"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              name="name"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              placeholder="tuote-slug-url"
              name="slug"
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value.toLowerCase().replace(/ /g, "-"),
                })
              }
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
            <label htmlFor="price">Hinta</label>
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
            <label htmlFor="description">Kuvaus</label>
            <textarea
              id="description"
              name="description"
              placeholder="Kirjoita tuotteen kuvaus"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
        </div>
      </div>
      <div className="product-modal-button">
        <Button onClick={save} text={"Lisää"} type={"add"} />
      </div>
    </Modal>
  );
};

export default AddProductModal;
