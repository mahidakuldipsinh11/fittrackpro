import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // Login.jsx stores the active user in localStorage.  Reading the same value
  // here prevents the cart page from trying to use an AuthContext provider
  // that is not mounted in App.jsx.
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
