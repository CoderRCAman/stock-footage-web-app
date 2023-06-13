import React from "react";
import { Link } from "react-router-dom";
import { isAuthenticated, logout } from "../../utils/auth";
import { useSelector } from "react-redux";

export default function Navbar() {
  const user = useSelector((state) => state.user);
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="font-Geologica flex-1 ">
          <Link to="/">
            <h1 className="flex text-xl text-purple-600">
              Stock <span>Footage</span>
            </h1>
          </Link>
        </div>
      </div>
      <div className="hidden md:flex navbar-center font-Geologica  gap-5">
        <Link to="/stock-image"> Stock Images </Link>
        <Link to="/stock-video"> Stock Videos </Link>
        <Link to="/pricing"> Pricing</Link>
      </div>
      <div className="navbar-end font-Geologica  ">
        <div className="hidden md:flex space-x-5">
          {!isAuthenticated() && (
            <Link to="/login">
              <button className="outline-none border-[1px] border-emerald-500 px-5 flex gap-1 py-1 rounded-full hover:bg-emerald-200 hover:text-emerald-600 ">
                Login
                <span className="swap-on">🥳</span>
              </button>
            </Link>
          )}
          {!isAuthenticated() && (
            <Link to="/signup">
              <button className="outline-none border-[1px] flex gap-1 border-purple-500 px-5 py-1 rounded-full hover:bg-purple-200 hover:text-purple-600">
                Signup
                <span className="swap-on">😇</span>
              </button>
            </Link>
          )}
          {isAuthenticated() && (
            <div className="dropdown dropdown-end ">
              <div tabIndex={0} className="avatar ">
                <div className="w-12 rounded-full cursor-pointer">
                  <img
                  className="object-cover aspect-auto"
                    src={
                      user?.avatar ||
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                    }
                    alt="Tailwind-CSS-Avatar-component"
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-3 border-[1px] space-y-2 border-slate-800 mt-5 shadow-md  bg-base-100 rounded-box w-52"
              >
                <Link to="/profile">
                  <li>
                    <h1 className="flex justify-center border-[1px] border-indigo-900 ">
                      Profile
                    </h1>
                  </li>
                </Link>
                <li>
                  <button
                    onClick={() => logout()}
                    className="outline-none border-[1px] border-red-500 text-red-500 flex justify-center"
                  >
                    Log out
                    <span className="swap-off">😭</span>
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Mobile view  */}
        </div>
        <div className={`dropdown dropdown-end  md:hidden relative  `}>
          <label tabIndex="0" className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </label>
          <ul
            tabIndex="0"
            className="menu z-20 menu-sm dropdown-content space-y-2 shadow-md mt-3 p-2 border-[1px] border-slate-700 bg-base-100 rounded-box w-52 font-Geologica"
          >
            <li>
              <Link to="/stock-image">Stock Images</Link>
            </li>
            <li>
              <Link to="/stock-video">Stock Videos</Link>
            </li>
            <li>
              <Link to="/pricing">Stock Pricing</Link>
            </li>
            {!isAuthenticated() && (
              <li>
                <Link to="/login">
                  <button className="outline-none border-[1px] gap-1 flex items-center border-emerald-500 px-5 py-1 rounded-full  ">
                    Login
                    <span className="swap-on">🥳</span>
                  </button>
                </Link>
              </li>
            )}
            {!isAuthenticated() && (
              <li>
                <Link to="/signup">
                  <button className="outline-none border-[1px] border-purple-500 flex gap-1 px-5 py-1 rounded-full ">
                    Signup
                    <span className="swap-on">😇</span>
                  </button>
                </Link>
              </li>
            )}
            {isAuthenticated() && (
              <li>
                <Link to="/profile">
                  <h1>Profile</h1>
                </Link>
              </li>
            )}
            {isAuthenticated() && (
              <li>
                <Link>
                  <button
                    onClick={() => logout()}
                    className="outline-none border-[1px] px-5 flex gap-1 py-1 border-red-500 text-red-500 rounded-full"
                  >
                    Log out
                    <span className="swap-off">😭</span>
                  </button>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
