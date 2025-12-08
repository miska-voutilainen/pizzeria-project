import SquareButton from "../SquareButton/SquareButton";
import "./AdminProductCard.css";
import TagIcon from "../../assets/images/tag-icon.svg";

const AdminProductCard = ({ props }) => {
  const { category, imgUrl, name, price, id, description } = props;

  return (
    <div id="admin-product-card-container">
      <div className="admin-product-card-id-row">
        <p className="product-id">#{id}</p>
        <SquareButton type={"edit"} />
      </div>
      <div className="admin-product-card-img-row">
        <div className="admin-product-card-img-container">
          <img src={imgUrl} width="80" alt={name} />
        </div>
        <div className="admin-product-card-text-container">
          <div className="admin-product-card-tag-container">
            <img src={TagIcon} alt="tag icon" />
            <p>{category}</p>
          </div>
          <h2 className="admin-product-card-title">{name}</h2>
          <p className="admin-product-card-price">Hinta: {price}€</p>
          <p className="admin-product-card-description">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminProductCard;
