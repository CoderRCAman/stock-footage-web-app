import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { fail, success } from "../../components/Snackbar/Snackbar";
import { Sleep } from "../../utils/auth";

export default function EditProductModal({ update }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  useEffect(() => {
    setTitle(update?.title), setDescription(update?.description);
  }, [update]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description)
      return fail("Please include both the title and description!");
    try {
      const res = await axios.patch(
        `http://localhost:4269/api/v1/file/edit/${update._id}`,
        {
          title,
          description,
        },
        {
          withCredentials: true,
        }
      );
      if (res.status == 200) {
        success("Updated footage success!");
        await Sleep(1500);
        window.location.reload();
      }
    } catch (error) {
      fail(error?.reponse?.data?.msg || error?.message);
    }
  };
  return (
    <dialog id="my_modal_6" className="modal">
      <div method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Edit Footage</h3>
        <form onSubmit={handleSubmit}>
          <span className="text-rose-600 text-xs font-Geologica font-semibold">
            *Only footage title and description can be updated!*
          </span>
          <div className="flex flex-col  w-full max-w-xs">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="py-2 rounded-full outline-none border-[1px] border-purple-900 px-4"
            />
          </div>
          <div className="flex flex-col  w-full max-w-xs">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="py-2 rounded-full outline-none border-[1px] border-purple-900 px-4"
            />
          </div>
          <button className="btn btn-success btn-outline mt-5">Update</button>
        </form>
        <div className="modal-action">
          {/* if there is a button in form, it will close the modal */}
          <button onClick={() => window.my_modal_6.close()} className="btn">
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
