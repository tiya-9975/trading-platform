// frontend/src/pages/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      const res = await authAPI.signup({
        name: form.fullName,
        email: form.email,
        password: form.password,
      });

      if (res.data.success) {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      
      {/* TRADEPRO HEADING (Blue) */}
      <h1 className="text-4xl font-extrabold text-blue-500 mb-1">
        TradePro
      </h1>

      <p className="text-gray-300 mb-8">Invest Smarter</p>

      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-blue-600">
          Create Your Account
        </h2>

        {error && (
          <p className="mb-4 text-red-600 text-center font-medium">{error}</p>
        )}

        {/* Full Name */}
        <label className="block text-gray-700 font-medium mb-1">
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          placeholder="John Doe"
          required
          value={form.fullName}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-lg bg-gray-50"
        />

        {/* Email */}
        <label className="block text-gray-700 font-medium mb-1">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-lg bg-gray-50"
        />

        {/* Password */}
        <label className="block text-gray-700 font-medium mb-1">
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-lg bg-gray-50"
        />

        {/* Confirm Password */}
        <label className="block text-gray-700 font-medium mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          required
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full p-3 mb-6 border rounded-lg bg-gray-50"
        />

        {/* Sign Up Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-lg"
        >
          Sign Up
        </button>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Sign in
          </Link>
        </p>
      </form>

      {/* Demo Note */}
      <p className="text-gray-400 text-sm mt-6">
        🎉 Start with $100,000 virtual cash to practice trading
      </p>
    </div>
  );
};

export default Signup;
