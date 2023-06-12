import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const fetchCategories = createAsyncThunk("fetch/categories", async () => {
  try {
    const categories = await axios.get(
      "http://localhost:4269/api/v1/category",
      {
        withCredentials: true,
      }
    );
    return categories.data || [];
  } catch (error) {
    let errorData = {
      code: `${error?.response?.status || "511"}`,
      message: error?.response?.data.msg || error?.message,
    };
    throw errorData;
  }
});

export { fetchCategories };
