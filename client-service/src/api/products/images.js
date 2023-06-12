import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { isAuthenticated } from "../../utils/auth";

const fetchImage = async (data) => {
  try {
    let isauth = isAuthenticated();
    console.log(data);
    if (isauth) {
      const user = await axios.get(`http://localhost:4269/api/v1/user/images`, {
        withCredentials: true,
        params: {
          page: `${data.page}`,
          limit: `${data.limit}`,
        },
      });
      return user.data;
    } else {
      const images = await axios.get(
        "http://localhost:4269/api/v1/user/guest/images"
      );
      return images.data;
    }
  } catch (error) {
    let errorData = {
      code: `${error?.response?.status || "511"}`,
      message: error?.response?.data.msg || error?.message,
    };
    throw errorData;
  }
};
const fetchImages = createAsyncThunk("fetch/images", fetchImage);
const fetchImagesUpdate = createAsyncThunk("fetch/imagesupdate", fetchImage);

export { fetchImages, fetchImagesUpdate };
