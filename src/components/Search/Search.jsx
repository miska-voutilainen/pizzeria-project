import searchIcon from "../../assets/images/search-icon.svg";
import "./Search.css";

const Search = ({ inputPlaceholder, name }) => {
  return (
    <div className="search-container">
      <input type="text" name={name} id="" placeholder={inputPlaceholder} />
    </div>
  );
};

export default Search;
