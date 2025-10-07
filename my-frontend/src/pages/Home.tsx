import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PostBar from "../components/postbar";
import Profile from "../components/Profile";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./pages_style/Landing.css";
import MockComponent from "../components/Mock";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      
      navigate("/Login");
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
        navigate("/Login");
      });
  }, [navigate]);

  return (
    <div>
      <div className="top">
        <Topbar />
        <div>
          <Profile />
        </div>
      </div>
      <hr className="divider" />
      <PostBar />
      <hr className="divider2" />
      <div className="container">
        <Sidebar />
        <MockComponent />
      </div>
    </div>
  );
}

export default Home;
