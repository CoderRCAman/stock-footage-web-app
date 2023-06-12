import { createSlice } from "@reduxjs/toolkit";
import { fetchUser } from "../api/user/user";
import { handleError } from "../utils/auth";
const initialState = {
  uploads: [],
  purchases: [],
  downloads: [],
};
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateRecommend(state, action) {
      state.recommend = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      if (action.payload == undefined) return {};
      return action.payload[0];
    });
    builder.addCase(fetchUser.rejected, (state, action) => {
      console.log(action.error);
      handleError(action.error);
    });
  },
});

export const { updateRecommend } = userSlice.actions;

export default userSlice.reducer;
