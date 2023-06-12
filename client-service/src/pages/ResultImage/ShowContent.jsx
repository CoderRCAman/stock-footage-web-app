import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import RenderImages from "../../components/RenderImage/RenderImage";
import axios from "axios";

export default function ShowContent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const urlParams = new URLSearchParams(window.location.search);
  const searchValue = urlParams.get("search" || "");
  const categoryValue = urlParams.get("category" || "");
  const type = urlParams.get("type" || "");
  const categoryId = urlParams.get("id" || "");
  const [images, setImages] = useState({
    page: 1,
    limit: 2,
    images: [],
    loading: false,
  });
  const searchImages = async (search) => {
    try {
      setImages({ ...images, loading: false });
      const res = await axios.get(
        "http://localhost:4269/api/v1/file/search/images",
        {
          withCredentials: true,
          params: {
            search: search,
            page: images.page.toString(),
            limit: images.limit.toString(),
          },
        }
      );
      if (res.status == 200) {
        console.log(res.data);
        setImages({
          page: res.data.page,
          limit: res.data.limit,
          images: res.data.results,
          count: res.data.count,
          loading: false,
        });
      }
    } catch (error) {
      setImages({ ...images, loading: false });
      console.log(error);
    }
  };
  const fetchMore = async () => {
    setImages({ ...images, loading: true });
    if (search) {
      try {
        const res = await axios.get(
          "http://localhost:4269/api/v1/file/search/images",
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
            images: images.images.concat(res.data.results),
            count: res.data.count,
            loading: false,
          });
        }
      } catch (error) {
        setImages({ ...images, loading: false });
        console.log(error);
      }
    } else {
      try {
        const res = await axios.get(
          `http://localhost:4269/api/v1/file/category/images/${categoryId}`,
          {
            withCredentials: true,
            params: {
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
            images: images.images.concat(res.data.results),
            count: res.data.count,
            loading: false,
          });
        }
      } catch (error) {
        setImages({ ...images, loading: false });
        console.log(error);
      }
    }
  };
  const categoryImages = async (id) => {
    setImages({ ...images, loading: false });
    try {
      const res = await axios.get(
        `http://localhost:4269/api/v1/file/category/images/${id}`,
        {
          withCredentials: true,
          params: {
            page: images.page.toString(),
            limit: images.limit.toString(),
          },
        }
      );
      if (res.status == 200) {
        console.log(res.data);
        setImages({
          page: res.data.page,
          limit: res.data.limit,
          images: res.data.results,
          count: res.data.count,
          loading: false,
        });
      }
    } catch (error) {
      console.log(error);
      setImages({ ...images, loading: false });
    }
  };
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchValue = urlParams.get("search" || "");
    const categoryValue = urlParams.get("category" || "");
    const categoryId = urlParams.get("id" || "");
    if (searchValue) {
      //do something for search
      setSearch(searchValue);
      searchImages(searchValue);
    } else {
      setCategory(categoryValue);
      categoryImages(categoryId);
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
          <RenderImages images={images} browseMore={fetchMore} />
        </div>
      </div>
    </div>
  );
}
