import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardPage from "./DashboardPage";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:5000/protected/Home", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Access granted:", res.data);
      })
      .catch((err) => {
        console.error("Access denied:", err);
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  return (
    <div>
      <DashboardPage />
    </div>
  );
}

export default Home;