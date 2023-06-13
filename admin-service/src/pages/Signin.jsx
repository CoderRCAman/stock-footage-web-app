import axios from "axios";
import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:4269/api/v1/user/signin",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (res.status == 200) {
        if (res.data.role == "admin") {
          localStorage.setItem("auth", res.data.auth);
          localStorage.setItem("id", res.data.id);
          localStorage.setItem("role", res.data.role);
          alert("logged in");
          window.location.reload();
        } else {
          alert("not an admin");
        }
      }
    } catch (error) {
      alert(error?.response?.data?.msg || error?.message);
    }
  };
  return (
    <div
      className="h-screen flex justify-center"
      style={{
        background: "url('/src/assets/16367349_rm373batch7-17.jpg')",
        backgroundPosition: "50% 50%",
        backgroundSize: "cover",
      }}
    >
      <div className="sm:w-96 mx-5  w-full flex flex-col justify-center   ">
        <h1 className="text-gray-300 mb-5 text-3xl font-bold font-Montserrat  text-center ">
          Welcome to stock footage!
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-neutral-50 shadow-lg rounded-md p-4 flex flex-col gap-3 font-Nunito"
        >
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-lg text-purple-500 ">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@doe.com"
              className="outline-none border-[2px] px-4  py-1 border-purple-300 rounded-full focus:border-purple-500"
              type="email"
              name="email"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-lg text-purple-500 ">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              className="outline-none border-[2px] px-4 py-1 border-purple-300 rounded-full focus:border-purple-500"
              type="password"
              name="password"
            />
          </div>
          <button className="font-Geologica text-xl bg-purple-400 hover:bg-purple-500 p-2 rounded-full text-white">
            Login
          </button>
          <div></div>
        </form>
      </div>
    </div>
  );
}
