import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const fetchUser = createAsyncThunk("fetch/user", async () => {
  try {
    const user = await axios.get("http://localhost:4269/api/v1/user/userinfo", {
      withCredentials: true,
    });
    return user.data;
  } catch (error) {
    
    let errorData = {
      code: `${error?.response?.status || "511"}`,
      message: error?.response?.data.msg || error?.message,
    };
    throw errorData;
  }
});

export { fetchUser };
