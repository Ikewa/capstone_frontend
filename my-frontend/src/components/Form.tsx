import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./components_style/Form.css";

function Form() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    location: "",
    password: "",
    confirmPassword: "",
  });

  const locationPath = useLocation();
  const navigate = useNavigate();

  const isSignup = locationPath.pathname === "/Signup";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = isSignup ? "/users/signup" : "/users/login";

    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, formData);
      alert(response.data.message);

      if (!isSignup && response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/Home");
      } else if (isSignup) {
        navigate("/Login");
      }
    } catch (error: unknown) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "An error occurred");
      } else {
        alert("An error occurred");
      }
    }
  };

  return (
    <div>
      <h1 className="heading">{isSignup ? "Want to improve your farming?" : "Welcome Back"}</h1>
      <h2 className="subheading">{isSignup ? "Join us Now" : "Login to Continue"}</h2>

      <form className="form2" onSubmit={handleSubmit}>
        <input
          type="text"
          name="first_name"
          placeholder="First name"
          className="input2"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        <br />

        <input
          type="text"
          name="last_name"
          placeholder="Last name"
          className="input2"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        <br />

        <input
          type="text"
          name="location"
          placeholder="Location"
          className="input2"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="input2"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <br />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="input2"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <br />

        <button className="button2" type="submit">{isSignup ? "Sign Up" : "Login"}</button>
      </form>

      <a className="text" href="/Landing">Go Back</a>
    </div>
  );
}

export default Form;
