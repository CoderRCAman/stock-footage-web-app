import {
  EditFilled,
  PlusCircleOutlined,
  DeleteFilled,
} from "@ant-design/icons";
import React from "react";
import UploadModal from "./UploadModal";
import EditModal from "./EditModal";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Sleep, getDecodedString } from "../../utils/auth";
import EditProduct from "./EditProductModal";
import EditProductModal from "./EditProductModal";
import { useState } from "react";
import axios from "axios";
import { fail, success } from "../../components/Snackbar/Snackbar";
export default function ShowProfile() {
  const user = useSelector((state) => state.user);
  const [update, setUpdate] = useState(null);
  console.log(user);

  const deleteFootage = async (id) => {
    try {
      const res = await axios.delete(
        `http://localhost:4269/api/v1/file/delete/${id}`,
        {
          withCredentials: true,
        }
      );
      if (res.status == 200) {
        success("Deleted successfully!");
        await Sleep(1000);
        window.location.reload();
      }
    } catch (error) {
      fail(error?.reponse?.data?.msg || error?.message);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="container mt-20 flex flex-col items-center justify-start">
        <div className="flex flex-col md:flex-row items-center md:gap-20 gap-5">
          <img
            className="h-32 w-32 rounded-full object-cover"
            src={
              user?.avatar ||
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            }
          />
          <div className="font-Montserrat space-y-2">
            <h1>{user?.name}</h1>
            <h2 className="font-semibold">{user?.email}</h2>
            <h3 className="font-semibold">{user?.phone}</h3>
            <span className="font-semibold text-orange-500 border-[1px] border-orange-900 p-1 block text-center rounded-md ">
              {user?.credits} <span className="text-orange-700">Credits</span>
            </span>
          </div>
          <div>
            <button
              onClick={() => window.my_modal_2.showModal()}
              className="flex items-center font-Geologica border-[1px] px-8 gap-1 border-purple-800 text-purple-500 py-2 rounded-full"
            >
              <EditFilled />
              Edit
            </button>
          </div>
        </div>

        <div className="flex gap-10 items-center mt-20 font-Geologica">
          <h1>Upload content</h1>
          <button
            onClick={() => window.my_modal_1.showModal()}
            className="flex items-center gap-2 px-10 py-2 outline-none border-[1px] border-emerald-700 rounded-full text-emerald-600"
          >
            <PlusCircleOutlined /> Upload
          </button>
        </div>

        <div className="mt-10 space-y-3 font-Nunito">
          <div className="collapse collapse-plus bg-base-200">
            <input type="radio" name="my-accordion-3" />
            <div className="collapse-title text-xl font-medium">
              View all premium downloads
            </div>
            <div className="collapse-content">
              {user?.downloads?.length == 0 ? (
                <p className="text-fuchsia-600">No uploads</p>
              ) : (
                <>
                  {user.downloads.map((u) => (
                    <div
                      key={u?._id}
                      className="mb-4 flex items-center border-b-[1px] border-slate-800 py-1 justify-between px-2"
                    >
                      {u?.file[0]?.type == "image" ? (
                        <Link
                          to={`/image/`}
                          state={{
                            ...u?.file[0],
                            catgory: u?.file[0]?.category[0],
                            resolution: `${u.file[0].height} x ${u.file[0].width}`,
                          }}
                        >
                          <img
                            className="object-cover h-24 w-24"
                            src={u?.file[0]?.public_url}
                          />
                        </Link>
                      ) : (
                        <Link
                          to={`/video/`}
                          state={{
                            ...u?.file[0],
                            catgory: u?.file[0]?.category[0],
                            resolution: `${u.height} x ${u.width}`,
                          }}
                        >
                          <video
                            className="h-24 w-24 object-cover aspect-auto"
                            mutes
                            onMouseEnter={(e) => e.target.play()}
                            onMouseLeave={(e) => e.target.pause()}
                          >
                            <source src={u?.file[0]?.public_url} />
                          </video>
                        </Link>
                      )}
                      <h1>{getDecodedString(u?.file[0]?.title)}</h1>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="collapse collapse-plus bg-base-200">
            <input type="radio" name="my-accordion-3" />
            <div className="collapse-title text-xl font-medium">
              View purchases
            </div>
            <div className="collapse-content">
              {user?.payments?.length == 0 ? (
                <p className="text-fuchsia-600">No Payments</p>
              ) : (
                <>
                  <div className="mb-4 flex items-center border-b-[1px] border-slate-800 py-1 justify-between px-2">
                    <h1>Amount</h1>
                    <h1>Date</h1>
                    <h1>Credits</h1>
                  </div>
                  {user.payments?.map((p) => (
                    <div
                      key={p._id}
                      className="mb-4 flex items-center border-b-[1px] border-slate-800 py-1 justify-between px-2"
                    >
                      <h1>{getDecodedString(p.amount)}</h1>
                      <h1>{new Date(p.createdAt).toLocaleDateString()}</h1>
                      <h1>{p.credits}</h1>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="collapse collapse-plus md:w-[500px]  bg-base-200">
            <input type="radio" name="my-accordion-3" />
            <div className="collapse-title text-xl font-medium">
              View all uploads
            </div>
            <div className="collapse-content">
              {user?.uploads?.length == 0 ? (
                <p className="text-fuchsia-600">No uploads</p>
              ) : (
                <>
                  {user.uploads.map((u) => (
                    <div
                      key={u._id}
                      className="mb-4 flex items-center border-b-[1px] border-slate-800 py-1 justify-between px-2"
                    >
                      {u.type == "image" ? (
                        <Link
                          to={`/image/`}
                          state={{
                            ...u,
                            resolution: `${u.height} x ${u.width}`,
                          }}
                        >
                          <img
                            className="object-cover h-24 w-24"
                            src={u.public_url}
                          />
                        </Link>
                      ) : (
                        <Link
                          to={`/video/`}
                          state={{
                            ...u,
                            resolution: `${u.height} x ${u.width}`,
                          }}
                        >
                          <video
                            className="h-24 w-24 object-cover aspect-auto"
                            mutes
                            onMouseEnter={(e) => e.target.play()}
                            onMouseLeave={(e) => e.target.pause()}
                          >
                            <source src={u.public_url} />
                          </video>
                        </Link>
                      )}
                      <h1>{getDecodedString(u.title)}</h1>
                      <div className="flex items-center gap-4">
                        <EditFilled
                          onClick={() => {
                            setUpdate(u);
                            window.my_modal_6.showModal();
                          }}
                        />
                        <DeleteFilled
                          onClick={() => {
                            if (confirm("Are you sure you want to delete?")) {
                              deleteFootage(u._id);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <UploadModal />
          <EditModal />
          <EditProductModal update={update} />
        </div>
      </div>
    </div>
  );
}
