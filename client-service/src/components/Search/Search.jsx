import React, { useState } from "react";
import SelectType from "./SelectType";
import { SearchOutlined } from "@ant-design/icons";

export default function Search() {
  const [selected, setSelected] = useState("images");
  const [focused, setFocused] = useState(false);
  function handleSubmit(e) {
    e.preventDefault();
    if (!selected) {
      //promt something
      return;
    }
    if (selected == "images") {
      window.location.href = `/result-image?search=${e.target[0].value}`;
    } else {
      window.location.href = `/result-video?search=${e.target[0].value}`;
    }
  }
  return (
    <div className="flex w-full justify-center mt-5  md:mt-12 z-0">
      <form
        onSubmit={handleSubmit}
        className={` ${
          focused ? "border-slate-700" : "border-slate-800"
        } flex w-[96%] md:w-[80%] justify-center border-[1px]    `}
      >
        <SelectType selected={selected} setSelected={setSelected} />
        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full outline-none px-4 font-Montserrat  border-slate-700"
        /> 
        <button className="flex items-center bg-neutral-700 p-2">
          <SearchOutlined className="text-2xl" />
        </button>
      </form>
    </div>
  );
}
