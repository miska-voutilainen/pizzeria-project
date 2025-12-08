import "./AddProductModal.css";

const AddProductModal = () => {
  return (
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
    </div>
  );
};

export default AddProductModal;
