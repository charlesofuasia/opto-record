"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fname,
        lname,
        email,
        phone,
        username,
        password,
      }),
    });
    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      router.push("/login");
    } else {
      alert(data.message || "Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-md p-8 rounded-2xl shadow-md w-[300px] lg:w-[500px] bg-primary">
        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6">
          Create an Account
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/*First Name*/}
          <div>
            <label htmlFor="fname" className="block text-sm font-medium">
              First Name
            </label>
            <input
              type="text"
              id="fname"
              value={fname}
              onChange={e => setFname(e.target.value)}
              className="input"
              placeholder="Enter your first name"
            />
          </div>
          {/*Last Name*/}
          <div>
            <label htmlFor="lname" className="block text-sm font-medium">
              Last Name
            </label>
            <input
              type="text"
              id="lname"
              value={lname}
              onChange={e => setLname(e.target.value)}
              className="input"
              placeholder="Enter your last name"
            />
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="Enter your email"
              required
            />
          </div>
          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="input"
              placeholder="Enter your phone number"
            />
          </div>
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="input"
              placeholder="Choose a username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="Create a password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="Re-enter your password"
              required
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-success w-full mt-2">
            Register
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-success-dark hover:underline font-medium"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
