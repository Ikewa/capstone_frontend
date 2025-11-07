import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardPage from "./DashboardPage";
import { useLanguage } from "../context/LanguageContext";

function Home() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    console.log('Current language:', language);
    
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
  }, [navigate, language]);

  return (
    <div>
      <DashboardPage />
    </div>
  );
}

export default Home;