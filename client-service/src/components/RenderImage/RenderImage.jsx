import React, { useRef } from "react";
import useTestData from "../RenderImage/useTestData";
import Gallery from "react-photo-gallery";
import { useDispatch, useSelector } from "react-redux";
import useOptimisedFile from "../RenderImage/useTestData";
import { Link } from "react-router-dom";
import { getDecodedString, isAuthenticated } from "../../utils/auth";
import { fetchImagesUpdate } from "../../api/products/images";
import { PropagateLoader } from "react-spinners";

const customRender = ({ photo, margin }) => {
  return (
    <Link key={photo.src} to="/image" state={photo}>
      <div
        className="relative cursor-pointer group rounded-sm "
        style={{
          margin,
          height: photo.height,
          width: photo.width,
        }}
      >
        <img
          className="w-full rounded-sm h-full group-hover:opacity-60 transition-all duration-300"
          src={photo.src}
        />
        <div className="absolute h-full  rounded-sm w-full  top-0 text-md font-Geologica ">
          <span className="truncate px-2 py-2 block text-gray-400 group-hover:text-gray-200">
            {getDecodedString(photo.title)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default function RenderImages({ images, browseMore }) {
  const { data } = useOptimisedFile(images.images);
  const dispatch = useDispatch();
  console.log(images);
  const handleBrowse = (e) => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    dispatch(
      fetchImagesUpdate({
        page: images.page + 1,
        limit: images.limit,
      })
    );
  };
  return (
    <>
      {data.length == 1 ? (
        <>
          <Link key={data[0].src} to="/image" state={data[0]}>
            <div className="flex justify-center">
              <div className="relative cursor-pointer group rounded-sm ">
                <img
                  className="max-w-[600px] max-h-[600px] rounded-sm h-full group-hover:opacity-60 transition-all duration-300"
                  src={data[0].src}
                />
                <div className="absolute h-full  rounded-sm w-full  top-0 text-md font-Geologica ">
                  <span className="truncate px-2 py-2 block text-gray-400 group-hover:text-gray-200">
                    {getDecodedString(data[0].title)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </>
      ) : (
        <Gallery photos={data} renderImage={customRender} />
      )}
      <div className="flex justify-center">
        {images.loading ? (
          <span>
            <PropagateLoader color="#10b981" />
          </span>
        ) : (
          <>
            {(!isAuthenticated() ||
              (images.count != 0 &&
                Math.ceil(images.count / images.limit) != images.page)) && (
              <button
                onClick={browseMore || handleBrowse}
                className="mt-6 py-2 px-10 border-[1px] border-purple-500 rounded-full text-sm font-Geologica text-white"
              >
                Browse more!
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
