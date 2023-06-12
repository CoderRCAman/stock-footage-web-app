import { useRef } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { fail, success } from "../../components/Snackbar/Snackbar";
import { PropagateLoader } from "react-spinners";
import axios from "axios";

export default function ImageUpload() {
  const [file, setFile] = useState(null);
  const imageRef = useRef(null);
  const category = useSelector((state) => state.category);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const onSubmit = async (data) => {
    console.log(data);
    if (data.license == "Choose Footage Type") {
      fail("Please select a license");
      return;
    }
    if (data.category == "choosecat") {
      fail("Please select a category");
      return;
    }
    console.log(imageRef.current.naturalHeight);
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("file", data.file[0]);
      formData.append("license", data.license);
      formData.append("category", data.category);
      formData.append("height", imageRef.current.naturalHeight);
      formData.append("width", imageRef.current.naturalWidth);
      const res = await axios.post(
        "http://localhost:4269/api/v1/image/upload",
        formData,
        {
          withCredentials: true,
        }
      );
      if (res.status == 200) {
        setLoading(false);
        success("Image was uploaded!");
        setSuccess("Uploaded!");
      }
    } catch (error) {
      setLoading(false);
      setError(error?.response?.data?.msg || error?.message);
      fail(error?.response.data.msg || error?.message);
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
          {...register("title", {
            required: true,
            minLength: 5,
            maxLength: 30,
          })}
          type="text"
          name="title"
          className="py-2 rounded-full outline-none border-[1px] border-purple-900 px-4"
        />
      </div>
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
      <div className="flex flex-col  w-full max-w-xs">
        <label>Description</label>
        <input
          {...register("description", {
            required: true,
            minLength: 5,
            maxLength: 100,
          })}
          type="text"
          name="description"
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
        accept=".png, .jpg, .jpeg"
        className="file-input file-input-bordered file-input-secondary w-full sm:w-full max-w-xs"
      />
      {errors?.file?.type == "required" && (
        <span className="p-2 block text-sm text-red-500 font-semibold">
          {" "}
          *image file is required
        </span>
      )}
      {file && (
        <img
          ref={imageRef}
          src={URL.createObjectURL(file)}
          className=" max-w-full max-h-72"
        />
      )}
      <select
        {...register("license", {
          required: true,
        })}
        className="select select-secondary w-full max-w-xs mt-3"
      >
        <option disabled value={"Choose Footage Type"} selected hidden>
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
            <h1 className="text-xs text-center text-emerald-500">
              {successMsg}
            </h1>
            <button className="btn btn-outline btn-success">Upload</button>
          </div>
        )}
      </div>
    </form>
  );
}
