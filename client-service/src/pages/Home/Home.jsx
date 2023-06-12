import React, { useRef } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Search from "../../components/Search/Search";
import Recommendation from "./Recommendation";

export default function Home() {
  const ref  = useRef()
  return (
    <>
      <Navbar /> 
      <Search />
      <Recommendation /> 
    </>
  );
}
