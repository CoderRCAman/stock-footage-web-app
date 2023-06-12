import React, { useState } from "react";
import Gallery from "react-photo-gallery";
import useTestData from "../../components/RenderImage/useTestData";
import RenderVideos from "../../components/RenderVideos/RenderVideos";
import RenderImages from "../../components/RenderImage/RenderImage";
import { isAuthenticated } from "../../utils/auth";
import { useSelector } from "react-redux";

export default function Recommendation() {
  const [footageType, setFootageType] = useState("images");
  const videos = useSelector((state) => state.videos);
  const images = useSelector((state) => state.images);

  const handleFootageType = (type) => {
    setFootageType(type);
  };
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="flex justify-center w-full mt-10 cursor-pointer">
        <h1
          className={`px-4 py-2  font-Nunito ${
            footageType == "images" ? "bg-gray-900" : "bg-gray-800"
          }`}
          onClick={() => handleFootageType("images")}
        >
          Images
        </h1>
        <h1
          className={`px-4 py-2  font-Nunito ${
            footageType == "videos" ? "bg-gray-900" : "bg-gray-800"
          }`}
          onClick={() => handleFootageType("videos")}
        >
          Videos
        </h1>
      </div>
      <div className="font-Montserrat mt-10 container space-y-8">
        {footageType == "images" ? (
          <>
            <h1 className="text-center text-xl font-semibold">
              Images for you
            </h1>

            <RenderImages images={images} />
          </>
        ) : (
          <>
            <h1 className="text-center text-xl font-semibold">
              Videos for you
            </h1>
            <RenderVideos videos={videos} />
          </>
        )}
      </div>
    </div>
  );
}
