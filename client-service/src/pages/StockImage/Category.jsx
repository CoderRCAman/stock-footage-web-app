import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function Category() {
  const category = useSelector((state) => state.category);
  return (
    <>
      <h1 className="font-Geologica text-3xl text-center mt-20">Categories</h1>
      <div className="flex justify-center font-Montserrat font-semibold">
        <div className=" mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3  container px-2 gap-2 ">
          {category.map((cat) => (
            <Link
              key={cat._id}
              to={`/result-image/?category=${cat.name}&id=${cat._id}`}
            >
              <div
                className="flex items-center justify-center text-2xl  text-gray-300 h-52 w-auto rounded-lg"
                style={{
                  background: `url('${cat.image_url}')`,
                  objectFit: "cover",
                  backgroundSize: "cover",
                  backgroundColor: "rgba(0,0,0,.3)",
                  backgroundBlendMode: "multiply",
                }}
              >
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
