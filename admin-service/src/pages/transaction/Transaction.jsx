import React from "react";
import Sidebar from "../../components/Sidebar";
export default function Transaction() {
  return (
    <div className="flex w-full overflow-hidden ">
      <Sidebar />
      <div className="flex flex-1 w-full justify-center overflow-hidden bg-gray-900">
        <div className="w-[80%] overflow-hidden">
          <div className="flex flex-col  w-full">
          <div className="mt-4 mb-4">
              <div className="relative flex w-full flex-wrap items-stretch">
                <input
                  type="search"
                  className="relative m-0 -mr-0.5 block w-[1px] min-w-0 flex-auto rounded-l border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
                  placeholder="Search"
                  aria-label="Search"
                  aria-describedby="button-addon1"
                />

                <button
                  className="relative z-[2] flex items-center rounded-r bg-gray-800 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-700 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-800 active:shadow-lg"
                  type="button"
                  id="button-addon1"
                  data-te-ripple-init
                  data-te-ripple-color="light"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
            
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
                    
                  <tr className="bg-gray-800">
                  <td className="p-3">
                    <div className="flex align-items-center">
                      <img
                        className="rounded-full h-12 w-12  object-cover"
                        src="https://images.unsplash.com/photo-1613588718956-c2e80305bf61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=634&q=80"
                        alt="unsplash image"
                      />
                      <div className="ml-3">
                        <div className="">Appple</div>
                        <div className="text-gray-500">mail@rgmail.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">Technology</td>
                  <td className="p-3 font-bold">200.00$</td>
                </tr>
                <tr className="bg-gray-800">
                      <td className="p-3">
                        <div className="flex align-items-center">
                          <img
                            className="rounded-full h-12 w-12  object-cover"
                            src="https://images.unsplash.com/photo-1613588718956-c2e80305bf61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=634&q=80"
                            alt="unsplash image"
                          />
                          <div className="ml-3">
                            <div className="">Appple</div>
                            <div className="text-gray-500">mail@rgmail.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">Technology</td>
                      <td className="p-3 font-bold">200.00$</td>
                    </tr>
                    <tr className="bg-gray-800">
                      <td className="p-3">
                        <div className="flex align-items-center">
                          <img
                            className="rounded-full h-12 w-12  object-cover"
                            src="https://images.unsplash.com/photo-1613588718956-c2e80305bf61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=634&q=80"
                            alt="unsplash image"
                          />
                          <div className="ml-3">
                            <div className="">Appple</div>
                            <div className="text-gray-500">mail@rgmail.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">Technology</td>
                      <td className="p-3 font-bold">200.00$</td>
                    </tr>
                    <tr className="bg-gray-800">
                      <td className="p-3">
                        <div className="flex align-items-center">
                          <img
                            className="rounded-full h-12 w-12  object-cover"
                            src="https://images.unsplash.com/photo-1613588718956-c2e80305bf61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=634&q=80"
                            alt="unsplash image"
                          />
                          <div className="ml-3">
                            <div className="">Appple</div>
                            <div className="text-gray-500">mail@rgmail.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">Technology</td>
                      <td className="p-3 font-bold">200.00$</td>
                    </tr>
                    <tr className="bg-gray-800">
                      <td className="p-3">
                        <div className="flex align-items-center">
                          <img
                            className="rounded-full h-12 w-12  object-cover"
                            src="https://images.unsplash.com/photo-1613588718956-c2e80305bf61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=634&q=80"
                            alt="unsplash image"
                          />
                          <div className="ml-3">
                            <div className="">Appple</div>
                            <div className="text-gray-500">mail@rgmail.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">Technology</td>
                      <td className="p-3 font-bold">200.00$</td>
                    </tr>
                    <tr className="bg-gray-800">
                      <td className="p-3">
                        <div className="flex align-items-center">
                          <img
                            className="rounded-full h-12 w-12  object-cover"
                            src="https://images.unsplash.com/photo-1613588718956-c2e80305bf61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=634&q=80"
                            alt="unsplash image"
                          />
                          <div className="ml-3">
                            <div className="">Appple</div>
                            <div className="text-gray-500">mail@rgmail.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">Technology</td>
                      <td className="p-3 font-bold">200.00$</td>
                    </tr>
                    <tr className="bg-gray-800">
                      <td className="p-3">
                        <div className="flex align-items-center">
                          <img
                            className="rounded-full h-12 w-12  object-cover"
                            src="https://images.unsplash.com/photo-1613588718956-c2e80305bf61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=634&q=80"
                            alt="unsplash image"
                          />
                          <div className="ml-3">
                            <div className="">Appple</div>
                            <div className="text-gray-500">mail@rgmail.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">Technology</td>
                      <td className="p-3 font-bold">200.00$</td>
                    </tr>
                    <tr className="bg-gray-800">
                      <td className="p-3">
                        <div className="flex align-items-center">
                          <img
                            className="rounded-full h-12 w-12  object-cover"
                            src="https://images.unsplash.com/photo-1613588718956-c2e80305bf61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=634&q=80"
                            alt="unsplash image"
                          />
                          <div className="ml-3">
                            <div className="">Appple</div>
                            <div className="text-gray-500">mail@rgmail.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">Technology</td>
                      <td className="p-3 font-bold">200.00$</td>
                    </tr>
                    <tr className="bg-gray-800">
                      <td className="p-3">
                        <div className="flex align-items-center">
                          <img
                            className="rounded-full h-12 w-12  object-cover"
                            src="https://images.unsplash.com/photo-1613588718956-c2e80305bf61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=634&q=80"
                            alt="unsplash image"
                          />
                          <div className="ml-3">
                            <div className="">Appple</div>
                            <div className="text-gray-500">mail@rgmail.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">Technology</td>
                      <td className="p-3 font-bold">200.00$</td>
                    </tr>
                    <tr className="bg-gray-800">
                      <td className="p-3">
                        <div className="flex align-items-center">
                          <img
                            className="rounded-full h-12 w-12  object-cover"
                            src="https://images.unsplash.com/photo-1613588718956-c2e80305bf61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=634&q=80"
                            alt="unsplash image"
                          />
                          <div className="ml-3">
                            <div className="">Appple</div>
                            <div className="text-gray-500">mail@rgmail.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">Technology</td>
                      <td className="p-3 font-bold">200.0sdasd0$</td>
                    </tr>
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
