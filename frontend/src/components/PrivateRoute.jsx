import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LoadingOverlay from "./LoadingOverlay";

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingOverlay message="Checking access..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
