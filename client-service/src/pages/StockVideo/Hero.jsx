import React from "react";

export default function Hero() {
  return (
    <div
      className="font-Nunito relative  mt-10 h-72 w-full flex justify-center items-center text-center text-slate-100 font-semibold"
      style={{
        backgroundSize: "cover",
        backgroundPosition: "50% !important",
        objectFit: "cover",
        backgroundBlendMode: "luminosity",
        backgroundColor: "rgba(0,0,0,0.1)",
      }}
    >
      <p className="w-full text-xl md:text-4xl md:w-[40%]">
        High quality footages awaits you!
      </p>
      <video autoPlay loop muted className="absolute -z-10 w-full h-full object-cover">
        <source src="/src/assets/VideoBg1.mp4" />
      </video>
    </div>
  );
}
