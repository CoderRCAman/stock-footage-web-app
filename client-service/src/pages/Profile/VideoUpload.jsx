import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { fail, success } from "../../components/Snackbar/Snackbar";
import axios from "axios";
import { useSelector } from "react-redux";
import { PropagateLoader } from "react-spinners";

export default function VideoUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccess] = useState("");
  const videoRef = useRef(null);
  const category = useSelector((state) => state.category);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [file]);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const onSubmit = async (data) => {
    if (data.license == "Choose Footage Type") {
      fail("Please select a license");
      return;
    }
    if (data.category == "choosecat") {
      fail("Please select a category");
      return;
    }
    try {
      setLoading(true); 
      setError("")
      setSuccess("")
      const formData = new FormData();
      console.log(data);
      console.log(videoRef.current.videoHeight, videoRef.current.videoWidth);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("file", data.file[0]);
      formData.append("license", data.license);
      formData.append("category", data.category);
      formData.append("height", videoRef.current.videoHeight);
      formData.append("width", videoRef.current.videoWidth);
      const res = await axios.post(
        "http://localhost:4269/api/v1/video/upload",
        formData,
        {
          withCredentials: true,
        }
      );
      if (res.status == 200) {
        success("Video was uploaded!");
        setSuccess("Uploaded!");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setError(error?.response?.data?.msg || error?.message);
      fail(error?.response?.data?.msg || error?.message);
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 space-y-4 font-Geologica"
    >
      <div className="flex flex-col  w-full max-w-xs">
        <label>Title</label>
        <input
          type="text"
          name="title"
          {...register("title", {
            required: true,
            minLength: 5,
            maxLength: 30,
          })}
          className="py-2 rounded-full outline-none border-[1px] border-purple-900 px-4"
        />
        {errors?.title?.type == "required" && (
          <span className="p-2 text-sm text-red-500 font-semibold">
            {" "}
            *title is required
          </span>
        )}
        {(errors?.title?.type == "minLength" ||
          errors?.title?.type == "maxLength") && (
          <span className="p-2 text-sm text-red-500 font-semibold">
            {" "}
            *title length must be withn 5 {"<="} 30
          </span>
        )}
      </div>
      <div className="flex flex-col  w-full max-w-xs">
        <label>Description</label>
        <input
          type="text"
          name="description"
          {...register("description", {
            required: true,
            minLength: 5,
            maxLength: 100,
          })}
          className="py-2 rounded-full outline-none border-[1px] border-purple-900 px-4"
        />
      </div>
      {errors?.description?.type == "required" && (
        <span className="p-2 text-sm text-red-500 font-semibold">
          {" "}
          *description is required
        </span>
      )}
      {(errors?.description?.type == "minLength" ||
        errors?.description?.type == "maxLength") && (
        <span className="p-2 text-sm text-red-500 font-semibold">
          {" "}
          *description length must be withn 5 {"<="} 100
        </span>
      )}
      <input
        {...register("file", {
          required: true,
        })}
        onChange={(e) => {
          console.log(e.target.files);
          if (e.target.files.length > 0) {
            setFile(null);
            setFile(e.target.files[0]);
          }
        }}
        type="file"
        name="file"
        accept="video/mp4"
        className="file-input file-input-bordered file-input-secondary w-full sm:w-full max-w-xs"
      />
      {errors?.file?.type == "required" && (
        <span className="p-2 block text-sm text-red-500 font-semibold">
          {" "}
          *video file is required
        </span>
      )}
      {file && (
        <video ref={videoRef} controls className="max-w-xs w-full max-h-72">
          <source src={URL.createObjectURL(file)} />
        </video>
      )}
      <select
        {...register("license", {
          required: true,
        })}
        placeholder="xyz"
        className="select select-secondary w-full max-w-xs mt-3"
      >
        <option disabled value={"Choose Footage Type"} hidden selected>
          Choose liscense
        </option>
        <option value={"f2u"}>Free to use</option>
        <option value={"std"}>Standard liscense</option>
      </select>

      <select
        {...register("category", {
          required: true,
        })}
        placeholder="xyz"
        className="select select-secondary w-full max-w-xs mt-3"
      >
        <option disabled value={"choosecat"} hidden selected>
          Choose a category
        </option>
        {category.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {" "}
            {cat.name}{" "}
          </option>
        ))}
      </select>

      <div className="flex justify-center mt-5">
        {loading ? (
          <div className="flex flex-col gap-7 items-center justify-center">
            <span>
              <PropagateLoader color="#36d7b7" />
            </span>
            <span className="text-center text-xs text-emerald-400">
              This process takes a while
              <br />
              As it goes through multiple stages of validations
              <br /> NSFW checks!
            </span>
          </div>
        ) : (
          <div className="flex mt-5 flex-col justify-center items-center gap-5">
            <h1 className="text-xs text-center text-pink-900">{error}</h1>
            <h1 className="text-xs text-center text-emerald-500">{successMsg}</h1>
            <button className="btn btn-outline btn-success">Upload</button>
          </div>
        )}
      </div>
    </form>
  );
}
