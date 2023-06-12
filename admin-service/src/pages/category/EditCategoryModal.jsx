import React, { useState } from "react";
import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import "./custom.css";
import { toast } from "react-toastify";
import axios from "axios";
import { Sleep } from "../../utility";
export default function EditCategoryModal({ data, open, onClose }) {
  const [file, setFile] = useState(null);
  const [input, setInput] = useState(data.name);
  const handleSubmit = async (e) => {
    console.log("hey");
    e.preventDefault();
    if (!input) {
      toast.error("Missing input or file", {
        autoClose: 1000,
      });
    }
    try {
      const formData = new FormData();
      formData.append("name", input);
      if (file) formData.append("file", file);
      const editRes = await axios.patch(
        `http://localhost:4269/api/v1/category/${data._id}`,
        formData
      );
      if (editRes.status == 200) {
        toast.success("Edit was successful!", {
          autoClose: 1000,
        });
        await Sleep(1000);
        window.location.reload();
      }
    } catch (error) {
      toast.error(error?.reponse.data.msg || error?.message);
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
          <div>
            <img
              src={file ? URL.createObjectURL(file) : data.image_url}
              className="w-32 h-32 object-cover mb-3"
            />

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
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-gray-500">Category Name</label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              name="name"
              className="max-w-xs p-2 bg-transparent outline-none border-[1px] text-emerald-400 border-emerald-600 rounded-md"
            />
          </div>

          <div>
            <button className="border-green-500 border-[1px] text-green-400 px-10 py-1 rounded-full">
              Edit
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
