import { useState } from "react";
import VideoUpload from "./VideoUpload";
import ImageUpload from "./ImageUpload";

export default function UploadModal() {
  const [type, setType] = useState("type");
  return (
    <>
      {/* Open the modal using ID.showModal(       ) method */}

      <dialog id="my_modal_1" className="modal hide-scroll">
        <div method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Upload your imaginations!</h3>
          <select
            onChange={(e) => setType(e.target.value)}
            className="select select-secondary w-full max-w-xs mt-3"
          >
            <option disabled value={"Choose Footage Type"} selected>
              Choose Footage type
            </option>
            <option value={"Videos"}>Videos</option>
            <option value={"Images"}>Images</option>
          </select>
          {type == "Videos" && <VideoUpload />}
          {type == "Images" && <ImageUpload />}

          <div className="modal-action">
            {/* if there is a button in form, it will close the modal */}
            <button onClick={() => window.location.reload()} className="btn">
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
