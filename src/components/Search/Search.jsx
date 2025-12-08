import "./Search.css";

const Search = ({ inputPlaceholder, name, onChange }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        name={name}
        id=""
        placeholder={inputPlaceholder}
        onChange={onChange}
      />
    </div>
  );
};

export default Search;
