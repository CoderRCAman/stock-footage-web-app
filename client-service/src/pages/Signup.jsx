import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import { fail, success } from "../components/Snackbar/Snackbar";
import { Sleep } from "../utils/auth";
import Loader from "../components/Loader/Loader";
import { useState } from "react";
export default function Signup() {
  const navigate = useNavigate();
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
    data = { ...data, phone: `+91${data.phone}` };
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:4269/api/v1/user/signup",
        data
      );
      if (res.status == 201) {
        setLoading(false);
        success("Signed up!");
        Sleep(1000);
        navigate("/login", {
          replace: true,
        });
      }
    } catch (error) {
      setLoading(false);
      fail(error?.response.data.msg || error?.message);
    }
  };
  return (
    <div
      className="h-screen flex justify-center"
      style={{
        background: "url('/src/assets/16367349_rm373batch7-17.jpg')",
        backgroundPosition: "50% 50%",
        backgroundSize: "cover",
      }}
    >
      <div className="sm:w-96 mx-5  w-full flex flex-col justify-center   ">
        <h1 className="text-gray-300 mb-5 text-3xl font-bold font-Montserrat  text-center ">
          Welcome to stock footage!
        </h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-neutral-50 shadow-lg rounded-md p-4 flex flex-col gap-3 font-Nunito"
        >
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-lg text-purple-500 ">
              Email
            </label>
            <input
              {...register("email", {
                required: true,
                pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/,
              })}
              placeholder="john@doe.com"
              className="outline-none border-[2px] px-4  py-1 border-purple-300 rounded-full focus:border-purple-500"
              type="email"
              name="email"
            />

            {errors?.email?.type == "required" && (
              <span className="p-2 text-sm text-red-500 font-semibold">
                {" "}
                email is required
              </span>
            )}
            {errors?.email?.type == "pattern" && (
              <span className="p-2 text-sm text-rose-500 font-semibold">
                {" "}
                provide a valid email address
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-lg text-purple-500 ">
              Name
            </label>
            <input
              placeholder="Jon Doe"
              className="outline-none border-[2px] px-4  py-1 border-purple-300 rounded-full focus:border-purple-500"
              type="text"
              name="name"
              {...register("name", {
                required: true,
                minLength: 5,
                maxLength: 30,
              })}
            />
            {errors?.name?.type == "required" && (
              <span className="p-2 text-sm text-red-500 font-semibold">
                {" "}
                name is required
              </span>
            )}
            {(errors?.name?.type == "minLength" ||
              errors?.name?.type == "maxLength") && (
              <span className="p-2 text-sm text-rose-500 font-semibold">
                {" "}
                name length should be 5{"<="}30
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-lg text-purple-500 ">
              Phone
            </label>
            <input
              placeholder="8989201928"
              className="outline-none border-[2px] px-4  py-1 border-purple-300 rounded-full focus:border-purple-500"
              type="text"
              name="text"
              {...register("phone", {
                required: true,
                pattern: /^\d{10}$/,
              })}
            />
            {errors?.phone?.type == "required" && (
              <span className="p-2 text-sm text-red-500 font-semibold">
                {" "}
                phone is required
              </span>
            )}
            {errors?.phone?.type == "pattern" && (
              <span className="p-2 text-sm text-rose-500 font-semibold">
                {" "}
                phone number is not valid
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-lg text-purple-500 ">
              Password
            </label>
            <input
              className="outline-none border-[2px] px-4 py-1 border-purple-300 rounded-full focus:border-purple-500"
              type="password"
              name="password"
              {...register("password", {
                required: true,
              })}
            />
            {errors?.password?.type == "required" && (
              <span className="p-2 text-sm text-red-500 font-semibold">
                {" "}
                password is required
              </span>
            )}
          </div>
          <div className="flex justify-center">
            {loading ? (
                <Loader />
            ) : (
              <button className="font-Geologica text-xl bg-purple-400 hover:bg-purple-500 px-5 py-1 rounded-full text-white">
                Signup
              </button>
            )}
          </div>

          <div>
            <Link to="/login">
              <h1 className="text-purple-800 font-semibold">
                Already have an account?
              </h1>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
