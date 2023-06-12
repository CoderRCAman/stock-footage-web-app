import React, { useState } from "react";
import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import "./custom.css";
import { toast } from "react-toastify";
import axios from "axios";
import { Sleep } from "../../utility";
export default function AddCategoryModal({ open, onClose }) {
  const [file, setFile] = useState(null);
  const [input, setInput] = useState("");
  const handleSubmit = async (e) => {
    console.log("hey");
    e.preventDefault();
    if (!input || !file) {
      toast.error("Missing input or file", {
        autoClose: 1000,
      }); 
      return 
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", input);
    try {
      const postRes = await axios.post(
        "http://localhost:4269/api/v1/category",
        formData,
        // {
        //   withCredentials: true,
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //   },
        // }
      );  
      if (postRes.status == 200) {
        toast.success("Category added!", {
          autoClose: 1000,
        });
        await Sleep(1000); 
        window.location.reload()
      }
    } catch (error) { 
      console.log(error)
      toast.error(error?.response?.data.msg || error?.message, {
        autoClose: 1000,
      });
    }
  };
  return (
    <>
      <Modal
        classNames={{
          modal: "customModal",
        }}
        open={open}
        onClose={onClose}
        center
      >
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="flex flex-col gap-2">
            <label className="text-gray-500">Category Name</label>
            <input
              onChange={(e) => setInput(e.target.value)}
              type="text"
              name="name"
              className="max-w-xs p-2 bg-transparent outline-none border-[1px] text-emerald-400 border-emerald-600 rounded-md"
            />
          </div>
          <div>
            <input
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
              type="file"
              name="file"
              className="text-gray-400 border-[1px] border-emerald-800 p-2 rounded-md"
            />
            {file && (
              <img
                src={URL.createObjectURL(file)}
                className="w-32 h-32 object-cover mt-3"
              />
            )}
          </div>

          <div>
            <button className="border-green-500 border-[1px] text-green-400 px-10 py-1 rounded-full">
              Add
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
