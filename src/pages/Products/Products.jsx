import { useEffect, useState } from "react";
import api from "../../api";
import "./Products.css";
import Search from "../../components/Search/Search";
import SquareButton from "../../components/SquareButton/SquareButton";

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
    <section id="products-page-container">
      <h1 className="title">Tuotteet</h1>

      <div className="products-search-row">
        <Search inputPlaceholder="hae tuotteita" name="productSearch" />
        <SquareButton type={"add"} />
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
    </section>
  );
}
