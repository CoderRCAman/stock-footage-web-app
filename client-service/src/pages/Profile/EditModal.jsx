import { useState } from "react";
import { useRef } from "react";
import { fail, success } from "../../components/Snackbar/Snackbar";
import axios from "axios";
import { Sleep } from "../../utils/auth";
import { useSelector } from "react-redux";
import { useEffect } from "react";

export default function EditModal() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const user = useSelector((state) => state.user);
  useEffect(() => {
    setName(user.name);
  }, [user]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      return fail("Please enter name!");
    }

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    formData.append("name", name);
    try {
      const res = await axios.patch(
        "http://localhost:4269/api/v1/user/update",
        formData,
        {
          withCredentials: true,
        }
      );
      if (res.status == 200) {
        success("Updated profile!");
        await Sleep(1500);
        window.location.reload();
      }
    } catch (error) {
      fail(error?.reponse?.data?.msg || error?.message);
    }
  };
  return (
    <>
      {/* Open the modal using ID.showModal() method */}

      <dialog id="my_modal_2" className="modal font-Montserrat ">
        <div method="dialog" className="modal-box ">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="font-bold text-lg">Edit your profile!</h3>
            <div className="mt-10 flex justify-between items-center">
              <img
                className="h-32 w-32 object-cover rounded-full"
                src={
                  file
                    ? URL.createObjectURL(file)
                    : user.avatar ||
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                }
                onClick={() => inputRef.current.click()}
              />
              <input
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="hidden"
                ref={inputRef}
                type="file"
                name="file"
              />
              <p className="text-xs font-semibold italic">
                Click to change profile
              </p>
            </div>
            <div className="flex flex-col max-w-xs mt-4">
              <label htmlFor="">Name</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="py-2 px-2 rounded-full outline-none border-[1px] border-purple-600"
              />
            </div>
            <div>
              <button className="btn btn-outline btn-success ">Edit</button>
            </div>
          </form>
          <div className="modal-action">
            {/* if there is a button in form, it will close the modal */}
            <button onClick={() => window.my_modal_2.close()} className="btn">
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
