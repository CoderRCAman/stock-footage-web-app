import { enqueueSnackbar } from "notistack";
import { fail, success } from "../components/Snackbar/Snackbar";
import axios from "axios";

const isAuthenticated = () => {
  return localStorage.getItem("auth");
};

const isAdmin = () => {
  return localStorage.getItem("role") == "admin";
};

const Sleep = (duration) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("slept");
    }, duration);
  });
};

const handleError = (error) => {
  switch (error.code) {
    case "401":
      console.log("Please login!");
      localStorage.clear();
      break;
    case "403":
      fail("You are not allowed to access this!");
      break;
    case "511":
      fail("Netwrok Error");
      break;
    default:
      break;
  }
};

const logout = async () => {
  try {
    const res = await axios.get("http://localhost:4269/api/v1/logout", {
      withCredentials: true,
    });
    localStorage.clear();
    console.log(res);
    window.location.reload();
  } catch (error) {
    console.log(error);
  }
};
const getDecodedString = (str) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};
export {
  isAuthenticated,
  isAdmin,
  Sleep,
  handleError,
  logout,
  getDecodedString,
};
