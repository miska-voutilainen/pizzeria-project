import { useEffect, useState } from "react";
import api from "../../api";
import "./Products.css";
import Search from "../../components/Search/Search";
import SquareButton from "../../components/SquareButton/SquareButton";
import AdminProductCard from "../../components/AdminProductCard/AdminProductCard";
import AddProductModal from "../../components/AddProductModal/AddProductModal";
import EditProductModal from "../../components/EditProductModal/EditProductModal";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    price: "",
    imgUrl: "",
    category: "pizza",
    sort_order: 50,
  });
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const load = () => api.get("/products").then((r) => setProducts(r.data));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toString().includes(searchTerm)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleSave = async () => {
    if (editing) {
      try {
        const productData = {
          name: form.name,
          slug: form.slug,
          description: form.description,
          price: parseFloat(form.price) || 0,
          imgUrl: form.imgUrl,
          category: form.category,
          sort_order: form.sort_order,
        };
        await api.put(`/products/${editing.slug}`, productData);
        setIsEditModalOpen(false);
        setEditing(null);
        setForm({
          id: "",
          name: "",
          slug: "",
          description: "",
          price: "",
          imgUrl: "",
          category: "pizza",
          sort_order: 50,
        });
        load();
      } catch (error) {
        console.error("Failed to update product:", error);
        alert(
          `Failed to update product: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }
  };

  const handleAddSave = async () => {
    try {
      const productData = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: parseFloat(form.price) || 0,
        imgUrl: form.imgUrl,
        category: form.category,
        sort_order: form.sort_order,
      };
      const response = await api.post("/products", productData);
      alert(`Product added successfully! ID: ${response.data.id}`);
      setForm({
        id: "",
        name: "",
        slug: "",
        description: "",
        price: "",
        imgUrl: "",
        category: "pizza",
        sort_order: 50,
      });
      setIsModalOpen(false);
      load();
    } catch (error) {
      console.error("Failed to add product:", error);
      alert(
        `Failed to add product: ${error.response?.data?.error || error.message}`
      );
    }
  };

  const startEdit = (p) => {
    setForm(p);
    setEditing(p);
    setIsEditModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsModalOpen(false);
    setForm({
      id: "",
      name: "",
      slug: "",
      description: "",
      price: "",
      imgUrl: "",
      category: "pizza",
      sort_order: 50,
    });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditing(null);
    setForm({
      id: "",
      name: "",
      slug: "",
      description: "",
      price: "",
      imgUrl: "",
      category: "pizza",
      sort_order: 50,
    });
  };

  const remove = async (slug) => {
    if (confirm("Delete this product?")) {
      await api.delete(`/products/${slug}`);
      load();
    }
  };

  return (
    <section id="products-page-container">
      <h1 className="title">Tuotteet ({filteredProducts.length})</h1>
      <div className="products-search-row">
        <Search
          inputPlaceholder="hae tuotteita (nimi, kategoria tai ID)"
          name="productSearch"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SquareButton type={"add"} onClick={() => setIsModalOpen(true)} />
      </div>
      <div className="product-cards">
        {filteredProducts.map((p) => (
          <AdminProductCard key={p.slug} props={p} onEdit={startEdit} />
        ))}
      </div>
      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseAddModal}
        form={form}
        setForm={setForm}
        save={handleAddSave}
      />
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        product={editing}
        form={form}
        setForm={setForm}
        save={handleSave}
        remove={remove}
      />
    </section>
  );
}
