import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <ul className="border-r-[1px] border-r-[#2C68A8] w-[15%] h-screen font-mono text-xl">
      <li className=" p-3 flex justify-center items-center text-blue-300 border-b-[1px]  border-b-[#2C68A8] cursor-pointer hover:bg-[#09192B]">
        <Link to="/admin/dashboard/">Dashboard</Link>
      </li>

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
    </ul>
  );
}
