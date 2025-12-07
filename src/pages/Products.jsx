import { useEffect, useState } from "react";
import api from "../api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    imgUrl: "",
    category: "pizza",
    sortOrder: 50,
  });
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/products").then((r) => setProducts(r.data));
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (editing) {
      await api.put(`/products/${editing.slug}`, form);
    } else {
      await api.post("/products", form);
    }
    setForm({
      name: "",
      slug: "",
      description: "",
      price: "",
      imgUrl: "",
      category: "pizza",
      sortOrder: 50,
    });
    setEditing(null);
    load();
  };

  const startEdit = (p) => {
    setForm(p);
    setEditing(p);
  };

  const remove = async (slug) => {
    if (confirm("Delete this product?")) {
      await api.delete(`/products/${slug}`);
      load();
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Products Admin</h1>

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

      <h2>All Products ({products.length})</h2>
      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.slug}>
              <td>
                <img src={p.imgUrl} width="80" />
              </td>
              <td>{p.name}</td>
              <td>{p.price}€</td>
              <td>
                <button onClick={() => startEdit(p)}>Edit</button>
                <button
                  onClick={() => remove(p.slug)}
                  style={{ background: "red", color: "white", marginLeft: 10 }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
