import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import RenderImages from "../../components/RenderImage/RenderImage";
import RenderVideos from "../../components/RenderVideos/RenderVideos";
import axios from "axios";

export default function ShowContent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const urlParams = new URLSearchParams(window.location.search);
  const searchValue = urlParams.get("search" || "");
  const categoryValue = urlParams.get("category" || "");
  const type = urlParams.get("type" || "");
  const categoryId = urlParams.get("id" || "");
  const [videos, setVideos] = useState({
    page: 1,
    limit: 15,
    videos: [],
    count: 0,
    loading: false,
  });
  const searchVideos = async (search) => {
    try {
      setVideos({ ...videos, loading: true });
      const res = await axios.get(
        "http://localhost:4269/api/v1/file/search/videos",
        {
          withCredentials: true,
          params: {
            search: search,
            page: videos.page.toString(),
            limit: videos.limit.toString(),
          },
        }
      );
      if (res.status == 200) {
        console.log(res.data);
        setVideos({
          page: res.data.page,
          limit: res.data.limit,
          videos: res.data.results,
          count: res.data.count,
          loading: false,
        });
      }
    } catch (error) {
      console.log(error);
      setVideos({ ...videos, loading: false });
    }
  };

  const fetchMore = async () => {
    setVideos({ ...videos, loading: true });
    if (search) {
      try {
        const res = await axios.get(
          "http://localhost:4269/api/v1/file/search/videos",
          {
            withCredentials: true,
            params: {
              search: search,
              page: (images.page + 1).toString(),
              limit: images.limit.toString(),
            },
          }
        );
        if (res.status == 200) {
          console.log(res.data);
          setImages({
            ...images,
            page: res.data.page,
            limit: res.data.limit,
            videos: videos.videos.concat(res.data.results),
            count: res.data.count,
          });
          setVideos({ ...videos, loading: false });
        }
      } catch (error) {
        console.log(error);
        setVideos({ ...videos, loading: false });
      }
    } else {
      try {
        const res = await axios.get(
          `http://localhost:4269/api/v1/file/category/videos/${categoryId}`,
          {
            withCredentials: true,
            params: {
              page: (videos.page + 1).toString(),
              limit: videos.limit.toString(),
            },
          }
        );
        if (res.status == 200) {
          console.log(res.data);
          setVideos({
            ...videos,
            page: res.data.page,
            limit: res.data.limit,
            videos: videos.videos.concat(res.data.results),
            count: res.data.count,
            loading: false
          });
        }
      } catch (error) {
        console.log(error);
        setVideos({ ...videos, loading: false });
      }
    }
  };

  const categoryVideos = async (id) => {
    setVideos({ ...videos, loading: true });
    try {
      const res = await axios.get(
        `http://localhost:4269/api/v1/file/category/videos/${id}`,
        {
          withCredentials: true,
          params: {
            page: videos.page.toString(),
            limit: videos.limit.toString(),
          },
        }
      );
      if (res.status == 200) {
        console.log(res.data);
        setVideos({
          page: res.data.page,
          limit: res.data.limit,
          videos: res.data.results,
          count: res.data.count,
          loading: false,
        });
      }
    } catch (error) {
      console.log(error);
      setVideos({ ...videos, loading: false });
    }
  };
  useEffect(() => {
    if (searchValue) {
      //do something for search
      setSearch(searchValue);
      searchVideos(searchValue);
    } else {
      setCategory(categoryValue);
      categoryVideos(categoryId);
    }
  }, []);
  return (
    <div className="flex justify-center mt-10">
      <div className="container font-Montserrat">
        <h1 className="text-gray-400 font-semibold">
          Showing results for{" "}
          <span className="text-purple-500">{search || category}</span>
        </h1>
        <div className="mt-10">
          <RenderVideos videos={videos} browseMore={fetchMore} />
        </div>
      </div>
    </div>
  );
}
