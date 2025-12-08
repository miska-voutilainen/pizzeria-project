import { NavLink } from "react-router-dom";
import arrowIcon from "../../assets/images/arrow-icon.svg";

const AdminNavLinkItem = ({ to, icon, text, isRootPath = false }) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => {
          if (isRootPath) {
            return isActive || window.location.pathname === "/" ? "active" : "";
          }
          return isActive ? "active" : "";
        }}
      >
        {({ isActive }) => (
          <>
            <img src={icon} alt={`${text} icon`} />
            {text}
            {(isActive || (isRootPath && window.location.pathname === "/")) && (
              <>
                <img src={arrowIcon} alt="arrow icon" className="arrow-icon" />
              </>
            )}
          </>
        )}
      </NavLink>
    </li>
  );
};

export default AdminNavLinkItem;
