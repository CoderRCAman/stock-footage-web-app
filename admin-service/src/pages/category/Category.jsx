import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { EditFilled, DeleteFilled } from "@ant-design/icons";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import axios from "axios";
const initialState = {
  add: false,
  edit: false,
};
export default function Category() {
  const [open, setOpen] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [editCat , setEditCat] = useState(null)
  const handleOpen = (type) => {
    setOpen({
      ...initialState,
      [type]: true,
    });
  };
  const handleClose = () => {
    setOpen({
      ...initialState,
    });
  };
  useEffect(() => {
    async function fetchCategories() {
      try {
        const catRes = await axios.get("http://localhost:4269/api/v1/category");
        if (catRes.status == 200) setCategories(catRes.data || []);
      } catch (error) {
        console.log(error);
      }
    }
    fetchCategories();
  }, []);
  return (
    <>
      {open.add && <AddCategoryModal open={open.add} onClose={handleClose} />}
      {open.edit && (
        <EditCategoryModal
          data={editCat}
          open={open.edit}
          onClose={handleClose}
        />
      )}
      {/* {open.edit && <AddCategoryModal />} */}
      <div className="flex w-full overflow-hidden h-screen ">
        <Sidebar />
        <div className="overflow-y-scroll w-full  text-gray-400 ">
          <div className="w-full flex justify-center mt-10">
            <button
              onClick={() => handleOpen("add")}
              className="px-9 py-2 rounded-full border-[1px] border-emerald-600 text-emerald-400"
            >
              Add new
            </button>
          </div>
          {/* <form className=" flex justify-center mt-10">
                <input placeholder="Landscape" className="w-[50%] outline-none bg-transparent border-[1px]  border-emerald-700 p-2" />
                <button className="text-sm font-semibold bg-emerald-400 px-5 text-white">Add</button>
            </form>  */}
          <div className="mt-10 flex flex-col items-center gap-3 w-full justify-center pb-10">
            {categories.map((category) => (
              <div className="w-[50%] flex justify-between items-center bg-slate-950 p-4">
                <img
                  className="w-32 h-32 object-cover"
                  src={category.image_url}
                />
                <h1 className="font-medium capitalize">{category.name}</h1>
                <div className="flex gap-5 ">
                  <EditFilled
                    onClick={() => {
                      handleOpen("edit") 
                      setEditCat(category)
                    }}
                    className="text-blue-600 text-lg cursor-pointer"
                  />
                  <DeleteFilled className="text-red-600 text-lg cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
