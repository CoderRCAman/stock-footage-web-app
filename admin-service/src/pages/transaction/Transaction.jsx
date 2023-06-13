import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
export default function Transaction() {
  const [user, setUser] = useState([]);
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await axios.get(
          "http://localhost:4269/api/v1/user/all-transaction",
          {
            withCredentials: true,
          }
        );
        console.log(res.data);
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
            <div className=" w-full">
              <div className="overflow-auto h-[85vh] w-full">
                <table className=" text-gray-400 border-separate  w-full ">
                  <thead className="bg-gray-800 text-gray-500">
                    <tr className="w-full">
                      <th className="p-3">Name</th>
                      <th className="p-3 text-left">Credits</th>
                      <th className="p-3 text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.map((u) => (
                      <tr className="bg-gray-800">
                        <td className="p-3">
                          <div className="flex align-items-center">
                            <div className="ml-3">
                              <div className="">
                                {u?.user[0]?.name || "user"}
                              </div>
                              <div className="text-gray-500">
                                {u?.user[0]?.email || "user@gmail.com"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{u.credits}</td>
                        <td className="p-3 font-bold">Rs {u.amount}</td>
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
