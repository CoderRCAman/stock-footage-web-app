import { createSlice } from "@reduxjs/toolkit";
import { handleError, isAuthenticated } from "../utils/auth";
import { fetchImages, fetchImagesUpdate } from "../api/products/images";
const initialState = {
  count: 0,
  page: 1,
  type: isAuthenticated() ? "user" : "guest",
  images: [],
  limit: 15,
  loading: false,
};
const imageSlice = createSlice({
  name: "images",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchImages.pending, (state, _) => {
      state.loading = true;
    });
    builder.addCase(fetchImages.fulfilled, (state, action) => {
      if (state.type == "guest") {
        if (action?.payload) {
          state.totalCount = action.payload.length;
          state.images = action.payload;
        }
      } else {
        console.log(action);
        state.limit = action.payload.limit;
        (state.page = action.payload.page),
          (state.count = action.payload.count),
          (state.images = action.payload.results);
      }
      state.loading = false;
    });
    builder.addCase(fetchImages.rejected, (state, action) => {
      console.log(action);
      state.loading = false;
      handleError(action.error);
    });
    builder.addCase(fetchImagesUpdate.pending, (state, _) => {
      state.loading = true;
    });
    builder.addCase(fetchImagesUpdate.rejected, (state, action) => {
      console.log(action);
      handleError(action.error);
      state.loading = false;
    });
    builder.addCase(fetchImagesUpdate.fulfilled, (state, action) => {
      state.limit = action.payload.limit;
      (state.page = action.payload.page),
        (state.count = action.payload.count),
        (state.images = state.images.concat(action.payload.results));
      state.loading = false;
    });
  },
});

export default imageSlice.reducer;
