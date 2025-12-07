import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function useAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/check")
      .then((res) => {
        if (!res.data.authenticated || res.data.user.role !== "administrator") {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate]);
}
