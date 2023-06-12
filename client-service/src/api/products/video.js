import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { isAuthenticated } from "../../utils/auth";

const fetchVideo = async (data) => {
  try {
    if (isAuthenticated()) {
      const user = await axios.get(`http://localhost:4269/api/v1/user/videos`, {
        withCredentials: true,
        params: {
          page: data.page.toString(),
          limit: data.limit,
        },
      
      });
      return user.data;
    } else {
      const videos = await axios.get(
        "http://localhost:4269/api/v1/user/guest/videos"
      );
      return videos.data;
    }
  } catch (error) {
    console.log(error);
    let errorData = {
      code: `${error?.response?.status || "511"}`,
      message: error?.response?.data.msg || error?.message,
    };
    throw errorData;
  }
};

const fetchVideos = createAsyncThunk("fetch/videos", fetchVideo);
const fetchVideosUpdate = createAsyncThunk("fetch/videosupdate", fetchVideo);

export { fetchVideos, fetchVideosUpdate };
