import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { DownloadOutlined, StarFilled } from "@ant-design/icons";
import { getFile } from "../../api/file/file";
import { download } from "../../api/download/download";
const getDecodedString = (str) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};
export default function ShowVideo() {
  const { state } = useLocation();
  console.log(state);
  const [cat, setCat] = useState(
    state?.category?.name || state?.category[0]?.name || ""
  );
  return (
    <>
      <div className="w-full mt-10 bg-neutral-800  flex justify-evenly   flex-col xl:flex-row  xl:px-5    min-h-[200px]">
        <div className="xl:w-[85%]  flex justify-center py-5">
          <video controls className="max-h-[500px] max-w-full object-cover">
            <source src={state.src || state.public_url} />
          </video>
        </div>
        <div className="xl:w-[15%] w-full border-t-[1px] border-slate-700  xl:border-t-0 xl:border-l-[1px]  flex flex-row justify-center xl:justify-start xl:flex-col items-center gap-3 py-5">
          <div className=" text-sm font-Montserrat text-white bg-emerald-500 px-5 py-2 font-bold">
            {state.resolution} px
          </div>
          <button
            onClick={() => download(state)}
            className="flex items-center gap-2 text-purple-400 border-purple-600 border-[1px] px-10 py-2 rounded-full hover:bg-purple-300 font-semibold font-Geologica hover:text-purple-900"
          >
            <DownloadOutlined />
            Download
          </button>
          {state.license=="std" && (
            <div className="p-2 text-sm font-semibold text-center">
              To download this premium footage requires{" "}
              <span className="border-[1px] ml-2 border-slate-600 rounded-md text-orange-600 px-2">
                1 credit
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="w-full flex md:justify-start xl:px-40 mt-10 font-Nunito px-5">
        <div>
          <div className="avatar flex items-center gap-4 relative">
            <div className="w-10 rounded-full">
              <img
                src={
                  state?.user?.avatar ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                }
              />
            </div>

            <h1 className="text-xl text-blue-500 font-semibold">
              {state?.user?.name || "user"}
            </h1>
            <span className="text-xs text-emerald-300 flex items-center absolute -top-3 right-10">
              <StarFilled />
              <StarFilled />
              <StarFilled /> &nbsp; contributed
            </span>
          </div>
          <div className="mt-5 space-y-2">
            <h1 className="text-sm text-slate-400 font-semibold">
              <span className="text-slate-500 font-bold">id</span> {state?._id}
            </h1>
            <h1 className="text-sm text-slate-400 font-semibold">
              <span className="text-slate-500 font-bold">title</span>{" "}
              {getDecodedString(state?.title)}
            </h1>
            <h1 className="text-sm text-slate-400 font-semibold">
              <span className="text-slate-500 font-bold">Description</span>{" "}
              {getDecodedString(state?.description)}
            </h1>
            <h1 className="text-sm text-slate-400 font-semibold">
              <span className="text-slate-500 font-bold">Category</span>{" "}
              <span className="p-1 border-[1px] border-slate-600 ml-2 rounded-md">
                {getDecodedString(cat)}
              </span>
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}
