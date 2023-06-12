import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import categorySlice from "./categorySlice";
import imageSlice from "./imageSlice";
import videoSlice from "./videoSlice";

const store = configureStore({
  reducer: {
    user: userSlice,
    category: categorySlice,
    images: imageSlice,
    videos: videoSlice,
  },
});

export default store;
