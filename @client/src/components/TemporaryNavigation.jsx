// Navigation testing, delete later
import { Link } from 'react-router-dom';

function TemporaryNavigation() {
  return (
    <>
      <div>
        <Link to="/login">login/</Link>
        <br />
        <Link to="/register">register/</Link>
      </div>
    </>
  );
}

export default TemporaryNavigation;