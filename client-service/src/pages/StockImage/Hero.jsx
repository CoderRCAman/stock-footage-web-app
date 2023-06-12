import React from "react";

export default function Hero() {
  return (
    <div
      className="font-Nunito  mt-10 h-60 w-full flex justify-center items-center text-center text-slate-100 font-semibold"
      style={{
        background: "url('/src/assets/stock-image-bg-1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "50% !important",
        objectFit: "cover",
        backgroundBlendMode: "multiply",
        backgroundColor: "rgba(0,0,0,0.1)",
      }}
    >
      <p className="w-full text-xl md:text-4xl md:w-[40%]">Best in class Stock Images! Huge Collection awaits you.</p>
    </div>
  );
}
