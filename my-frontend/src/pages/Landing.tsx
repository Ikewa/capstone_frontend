import { useEffect, useState } from "react";
import PostBar from "../components/postbar";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./pages_style/Landing.css";
import MockComponent from "../components/Mock";

function Landing() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      
      setIsAuthenticated(false);
      return;
    }

    
    fetch("http://localhost:5000/protected/Home", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      });
  }, []);

  return (
    <div>
      <div className="top">
        <Topbar />
        {!isAuthenticated && (
          <div className="form">
            <a href="/Login" className="login">Login</a>
            <a href="/Signup" className="signup">Sign up</a>
          </div>
        )}
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

export default Landing;
