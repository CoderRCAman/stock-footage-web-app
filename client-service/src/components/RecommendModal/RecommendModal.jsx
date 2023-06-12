import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fail, success } from "../Snackbar/Snackbar";
import { updateRecommend } from "../../store/userSlice";

export default function RecommendModal() {
  const category = useSelector((state) => state.category);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState([]);
  const handleClick = (id) => {
    const idExist = selected.find((s_id) => s_id == id);
    if (idExist) {
      setSelected((item) => item.filter((i_id) => i_id !== id));
    } else {
      setSelected([...selected, id]);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected.length < 5) {
      fail("Please select atleast 5 categories!");
    }
    try {
      const res = await axios.patch(
        "http://localhost:4269/api/v1/user/recommend",
        {
          ids: selected,
        },
        {
          withCredentials: true,
        }
      );
      if (res.status == 200) {
        success("Recommended!");
        dispatch(updateRecommend());
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      fail(error?.response.data.msg || error?.message);
    }
  };
  return (
    <dialog id="my_modal_3" className="modal modal-bottom sm:modal-middle">
      <form onSubmit={handleSubmit} method="dialog" className="modal-box">
        <h3 className="font-bold text-lg text-fuchsia-700">
          Personalise your landing page!
        </h3>
        <p className="py-4 text-fuchsia-500 text-sm font-semibold ">
          Choose minimum of{" "}
          <span className="text-sm font-bold text-white mx-3">FIVE</span>{" "}
          categories
        </p>
        <div className="flex gap-5 flex-wrap">
          {category.map((cat) => (
            <div
              key={cat._id}
              onClick={() => {
                handleClick(cat._id);
              }}
              className={`border-[1px] cursor-pointer  p-2 rounded-md text-xs font-bold ${
                selected.find((id) => id == cat._id)
                  ? "border-slate-600"
                  : "border-slate-800"
              }`}
            >
              {cat.name}
            </div>
          ))}
        </div>
        <button className="mt-10 outline-none px-7 py-2 border-[1px] border-fuchsia-900 rounded-full text-xs text-fuchsia-500 font-bold hover:bg-fuchsia-300 hover:text-fuchsia-800">
          Personalize
        </button>
      </form>
    </dialog>
  );
}
