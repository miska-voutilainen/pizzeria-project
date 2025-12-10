import { useEffect, useState } from "react";
import api from "../../api";
import { StatusBadge } from "../../components";
import Search from "../../components/Search/Search";
import SquareButton from "../../components/SquareButton/SquareButton";
import AddCouponModal from "../../components/AddCouponModal/AddCouponModal";
import "./Coupons.css";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    code: "",
    discountPercentage: "",
    expiryDate: "",
  });
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCoupons = async () => {
    try {
      const response = await api.get("/coupons"); // ← unchanged, correct
      setCoupons(response.data);
      setFilteredCoupons(response.data);
    } catch (error) {
      console.error("Failed to load coupons:", error);
      setCoupons([]);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    const filtered = coupons.filter(
      (coupon) =>
        coupon.coupon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (coupon.id && coupon.id.toString().includes(searchTerm))
    );
    setFilteredCoupons(filtered);
  }, [searchTerm, coupons]);

  const handleSave = async () => {
    try {
      const couponData = {
        coupon: form.code,
        discount_percent: form.discountPercentage
          ? parseInt(form.discountPercentage)
          : null,
        expires_at: form.expiryDate || null,
      };
      if (editing) {
        await api.put(`/coupons/${editing}`, couponData);
        alert("Kuponki päivitetty onnistuneesti!");
      } else {
        await api.post("/coupons", couponData);
        alert("Kuponki lisätty onnistuneesti!");
      }
      setIsModalOpen(false);
      setEditing(null);
      setForm({ code: "", discountPercentage: "", expiryDate: "" });
      loadCoupons();
    } catch (error) {
      console.error("Failed to save coupon:", error);
      alert(
        `Failed to save coupon: ${error.response?.data?.error || error.message}`
      );
    }
  };

  const handleEdit = (coupon) => {
    setEditing(coupon.id);
    setForm({
      code: coupon.coupon,
      discountPercentage: coupon.discount_percent || "",
      expiryDate: coupon.expires_at || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await api.delete(`/coupons/${id}`);
        loadCoupons();
      } catch (error) {
        console.error("Failed to delete coupon:", error);
        alert(
          `Failed to delete coupon: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    }
  };

  const handleAddNew = () => {
    setEditing(null);
    setForm({ code: "", discountPercentage: "", expiryDate: "" });
    setIsModalOpen(true);
  };

  return (
    <section id="coupons-page-container">
      <h1 className="title">Kupongit ({filteredCoupons.length})</h1>
      <div className="coupons-search-row">
        <div className="users-page-search-container">
          <Search
            inputPlaceholder="hae kuponkeja"
            name="couponSearch"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <SquareButton type="add" onClick={handleAddNew} />
      </div>
      <div className="users-page-table-container coupons-page-table-container">
        <table>
          <thead>
            <tr>
              <th>Koodi</th>
              <th>Alennus %</th>
              <th>Voimassa saakka</th>
              <th>Toiminnot</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.map((coupon) => (
              <tr key={coupon.id}>
                <td>{coupon.coupon}</td>
                <td>{coupon.discount_percent || "-"}%</td>
                <td>{coupon.expires_at || "-"}</td>
                <td className="coupons-page-table-button">
                  <button onClick={() => handleEdit(coupon)}>Muokkaa</button>
                  <button onClick={() => handleDelete(coupon.id)}>
                    Poista
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddCouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        save={handleSave}
        editing={editing}
      />
    </section>
  );
}
