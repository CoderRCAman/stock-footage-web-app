import { createSlice } from "@reduxjs/toolkit";
import { fetchCategories } from "../api/category";
const initialState = [];
const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      console.log(action);
      return action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      console.log(action);
    });
  },
});

export default categorySlice.reducer;
