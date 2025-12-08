import "./AddProductModal.css";
import Modal from "../Modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  ActionButton,
} from "../index";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      title="Manage Products"
    >
      <div>
        <h2>{editing ? "Edit Product" : "Add New Product"}</h2>
        <div style={{ marginBottom: 40 }}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ width: 300, padding: 8, margin: 5 }}
          />
          <br />
          <input
            placeholder="Slug (url)"
            value={form.slug}
            onChange={(e) =>
              setForm({
                ...form,
                slug: e.target.value.toLowerCase().replace(/ /g, "-"),
              })
            }
            style={{ width: 300, padding: 8, margin: 5 }}
          />
          <br />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ width: 300, height: 80, padding: 8, margin: 5 }}
          />
          <br />
          <input
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            style={{ width: 300, padding: 8, margin: 5 }}
          />
          <br />
          <input
            placeholder="Image URL"
            value={form.imgUrl}
            onChange={(e) => setForm({ ...form, imgUrl: e.target.value })}
            style={{ width: 500, padding: 8, margin: 5 }}
          />
          <br />

          {/* Image Preview */}
          {form.imgUrl && (
            <div
              style={{
                margin: "10px 5px",
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 4,
                backgroundColor: "#f8f9fa",
                maxWidth: 520,
              }}
            >
              <div style={{ marginBottom: 8, fontSize: 14, color: "#666" }}>
                Image Preview:
              </div>
              <img
                src={form.imgUrl}
                alt="Product preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: 200,
                  borderRadius: 4,
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
                onLoad={(e) => {
                  e.target.style.display = "block";
                  e.target.nextSibling.style.display = "none";
                }}
              />
              <div
                style={{
                  display: "none",
                  color: "#dc3545",
                  fontSize: 14,
                  padding: 20,
                  textAlign: "center",
                }}
              >
                ❌ Invalid image URL or image failed to load
              </div>
            </div>
          )}

          <br />
          <button
            onClick={save}
            style={{
              padding: 10,
              background: "#28a745",
              color: "white",
              margin: 10,
            }}
          >
            {editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button
              onClick={() => {
                setEditing(null);
                setForm({
                  name: "",
                  slug: "",
                  description: "",
                  price: "",
                  imgUrl: "",
                  category: "pizza",
                  sortOrder: 50,
                });
              }}
            >
              Cancel
            </button>
          )}
        </div>

        <h2>All Products ({products?.length || 0})</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader width="100px">
                Image
              </TableCell>
              <TableCell isHeader>Name</TableCell>
              <TableCell isHeader width="80px">
                Price
              </TableCell>
              <TableCell isHeader width="140px">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((p) => (
              <TableRow key={p.slug}>
                <TableCell>
                  <img
                    src={p.imgUrl}
                    width="80"
                    style={{ borderRadius: "4px" }}
                  />
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.price}€</TableCell>
                <TableCell>
                  <ActionButton onClick={() => startEdit(p)}>Edit</ActionButton>
                  <ActionButton variant="danger" onClick={() => remove(p.slug)}>
                    Delete
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Modal>
  );
};

export default AddProductModal;
