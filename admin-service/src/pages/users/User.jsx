import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
export default function User() {
  const [user, setUser] = useState([]);
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await axios.get(
          "http://localhost:4269/api/v1/user/all-users",
          {
            withCredentials: true,
          }
        );
        if (res.status == 200) setUser(res.data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchUsers();
  }, []);
  return (
    <div className="flex w-full overflow-hidden ">
      <Sidebar />
      <div className="flex flex-1 w-full justify-center overflow-hidden bg-gray-900">
        <div className="w-[80%] overflow-hidden">
          <div className="flex flex-col  w-full">
            <div className="mt-4 mb-4"></div>

            <div className=" w-full">
              <div className="overflow-auto h-[85vh] w-full">
                <table className=" text-gray-400 border-separate  w-full ">
                  <thead className="bg-gray-800 text-gray-500">
                    <tr className="w-full">
                      <th className="p-3">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.map((u) => (
                      <tr className="bg-gray-800">
                        <td className="p-3">
                          <div className="flex align-items-center">
                            <img
                              className="rounded-full h-12 w-12  object-cover"
                              src={
                                u?.avatar ||
                                "https://images.unsplash.com/photo-1613588718956-c2e80305bf61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=634&q=80"
                              }
                              alt="unsplash image"
                            />
                            <div className="ml-3 flex justify-center items-center">
                              <div className="">{u?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{u?.email}</td>
                        <td className="p-3 font-bold">{u?.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
