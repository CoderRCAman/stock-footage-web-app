import React, { useRef } from "react";
import Gallery from "react-photo-gallery";
import { useDispatch, useSelector } from "react-redux";
import useOptimisedFile from "../RenderImage/useTestData";
import { Link } from "react-router-dom";
import { getDecodedString, isAuthenticated } from "../../utils/auth";
import { fetchVideosUpdate } from "../../api/products/video";
import { PropagateLoader } from "react-spinners";
function CustomRender({ photo, margin }) {
  const ref = useRef();
  return (
    <Link key={photo.src} to="/video" state={photo}>
      <div
        onMouseEnter={() => ref.current.play()}
        onMouseOut={() => ref.current.pause()}
        className="relative cursor-pointer group rounded-sm "
        style={{
          margin,
          height: photo.height,
          width: photo.width,
        }}
      >
        <video
          ref={ref}
          className="w-full h-full  group-hover:opacity-60 transition-all duration-300"
          muted
        >
          <source src={photo.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute h-full rounded-sm w-full  top-0 text-md font-Geologica ">
          <span className="truncate px-2 py-2 block text-gray-400 transition-all duration-500 group-hover:text-gray-200">
            {getDecodedString(photo.title)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function RenderVideos({ videos, browseMore }) {
  const { data } = useOptimisedFile(videos.videos);
  const dispatch = useDispatch();
  console.log(data);
  const handleBrowse = (e) => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
    }
    dispatch(
      fetchVideosUpdate({
        page: videos.page + 1,
        limit: videos.limit,
      })
    );
  };
  return (
    <>
      {data.length == 1 ? (
        <>
          <Link key={data[0].src} to="/video" state={data[0]}>
            <div className="flex justify-center">
              <div className="relative cursor-pointer group rounded-sm ">
                <video className="max-w-[600px] max-h-[600px] rounded-sm h-full group-hover:opacity-60 transition-all duration-300">
                  <source src={data[0].src} />
                </video>
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
        <Gallery
          photos={data}
          renderImage={(props) => <CustomRender {...props} />}
        />
      )}
      <div className="flex justify-center">
        {videos.loading ? (
          <span>
            <PropagateLoader color="#10b981" />
          </span>
        ) : (
          <>
            {(!isAuthenticated() ||
              (videos.count != 0 &&
                Math.ceil(videos.count / videos.limit) != videos.page)) && (
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
