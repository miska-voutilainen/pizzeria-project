import { useEffect, useState } from "react";
import api from "../../api";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  StatusBadge,
} from "../../components";
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
      const response = await api.get("/coupons");
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
      setForm({
        code: "",
        discountPercentage: "",
        expiryDate: "",
      });
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
    setForm({
      code: "",
      discountPercentage: "",
      expiryDate: "",
    });
    setIsModalOpen(true);
  };

  return (
    <div id="coupons-page-container">
      <h1 className="title">Kupongit ({filteredCoupons.length})</h1>

      <div className="coupons-search-row">
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <SquareButton type="add" onClick={handleAddNew} />
      </div>

      <div className="coupons-page-table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Koodi</TableCell>
              <TableCell>Alennus %</TableCell>
              <TableCell>Voimassa saakka</TableCell>
              <TableCell>Toiminnot</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>{coupon.coupon}</TableCell>
                <TableCell>{coupon.discount_percent || "-"}%</TableCell>
                <TableCell>{coupon.expires_at || "-"}</TableCell>
                <TableCell className="coupons-page-table-button">
                  <button
                    onClick={() => handleEdit(coupon)}
                    style={{ marginRight: "10px" }}
                  >
                    Muokkaa
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    style={{ color: "red" }}
                  >
                    Poista
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddCouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        save={handleSave}
        editing={editing}
      />
    </div>
  );
}
