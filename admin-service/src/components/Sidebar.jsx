import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Sleep } from "../utility";

export default function Sidebar() {
  return (
    <ul className="border-r-[1px] border-r-[#2C68A8] w-[15%] h-screen font-mono text-xl">
      <li className=" p-3 flex justify-center items-center text-blue-300 border-b-[#2C68A8] border-b-[1px] cursor-pointer hover:bg-[#09192B]">
        <Link to="/admin/category">Category</Link>
      </li>
      <li className=" p-3 flex justify-center items-center text-blue-300 border-b-[#2C68A8] border-b-[1px] cursor-pointer hover:bg-[#09192B]">
        <Link to="/admin/transaction">Transaction</Link>
      </li>
      <li className=" p-3 flex justify-center items-center text-blue-300 border-b-[#2C68A8] border-b-[1px] cursor-pointer hover:bg-[#09192B]">
        <Link to="/admin/user">Users</Link>
      </li>
      <li className=" p-3 flex justify-center items-center text-blue-300 border-b-[#2C68A8] border-b-[1px] cursor-pointer hover:bg-[#09192B]">
        <Link to="/admin/photo">Photo</Link>
      </li>
      <li className=" p-3 flex justify-center items-center text-blue-300 border-b-[#2C68A8] border-b-[1px] cursor-pointer hover:bg-[#09192B]">
        <Link to="/admin/video">Video</Link>
      </li>
      <li
        onClick={async () => {
          console.log("hello there");
          localStorage.clear();
          let res = await axios.get("http://localhost:4269/api/v1/logout", {
            withCredentials: true,
          });
          if (res.status == 200) {
            toast.success("Logged out!");
            await Sleep(1000);
            window.location.reload();
          }
        }}
        className=" p-3  flex justify-center items-center text-red-600 border-b-[#2C68A8] border-b-[1px] cursor-pointer hover:bg-[#09192B]"
      >
        Log out
      </li>
    </ul>
  );
}
