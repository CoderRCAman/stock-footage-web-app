import { createSlice } from "@reduxjs/toolkit";
import { handleError, isAuthenticated } from "../utils/auth";
import { fetchVideos, fetchVideosUpdate } from "../api/products/video";
const initialState = {
  count: 0,
  page: 1,
  type: isAuthenticated() ? "user" : "guest",
  videos: [],
  limit: 15,
  loading: true,
};
const videoSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchVideos.pending, (state, _) => {
      state.loading = true;
    });
    builder.addCase(fetchVideos.fulfilled, (state, action) => {
      if (state.type == "guest") {
        if (action?.payload) {
          state.totalCount = action.payload.length;
          state.videos = action.payload;
        }
      } else {
        console.log(action);
        state.limit = action.payload.limit;
        (state.page = action.payload.page),
          (state.count = action.payload.count),
          (state.videos = action.payload.results);
      }
      state.loading = false;
    });
    builder.addCase(fetchVideos.rejected, (state, action) => {
      console.log(action);
      state.loading = false;
      handleError(action.error);
    });
    builder.addCase(fetchVideosUpdate.rejected, (state, action) => {
      console.log(action);
      state.loading = false;
      handleError(action.error);
    });
    builder.addCase(fetchVideosUpdate.fulfilled, (state, action) => {
      state.limit = action.payload.limit;
      (state.page = action.payload.page),
        (state.count = action.payload.count),
        (state.videos = state.videos.concat(action.payload.results));
      state.loading = false;
    });
    builder.addCase(fetchVideosUpdate.pending, (state, _) => {
      state.loading = true;
    });
  },
});

export default videoSlice.reducer;
