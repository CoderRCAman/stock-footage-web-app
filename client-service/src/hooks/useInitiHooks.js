import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "../api/user/user";
import { fetchCategories } from "../api/category";
import { fetchImages } from "../api/products/images";
import { fetchVideos } from "../api/products/video";

export default function useInitHook() {
  const dispatch = useDispatch();
  let data = { page: 1, limit: 15 }
  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchCategories());
    dispatch(fetchImages(data));
    dispatch(fetchVideos(data));
  }, [dispatch]);
}
