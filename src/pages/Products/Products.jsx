import { useEffect, useState } from "react";
import api from "../../api";
import "./Products.css";
import Search from "../../components/Search/Search";
import SquareButton from "../../components/SquareButton/SquareButton";
import AdminProductCard from "../../components/AdminProductCard/AdminProductCard";
import AddProductModal from "../../components/AddProductModal/AddProductModal";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    price: "",
    imgUrl: "",
    category: "pizza",
    sortOrder: 50,
  });
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <h1 className="title">Tuotteet ({products.length})</h1>

      <div className="products-search-row">
        <Search inputPlaceholder="hae tuotteita" name="productSearch" />
        <SquareButton type={"add"} onClick={() => setIsModalOpen(true)} />
      </div>
      <div className="product-cards">
        {products.map((p) => (
          <AdminProductCard key={p.slug} props={p} />
        ))}
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
        form={form}
        setForm={setForm}
        editing={editing}
        setEditing={setEditing}
        save={save}
        startEdit={startEdit}
        remove={remove}
      />
    </section>
  );
}
