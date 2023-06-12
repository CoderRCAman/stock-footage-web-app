import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ShowPricing() {
  const [count, setCount] = useState(1);
  const handleIncDec = (type) => {
    if (type == "inc") setCount(count + 1);
    if (type == "dec" && count > 1) setCount(count - 1);
  };
  return (
    <div className="flex justify-center">
      <div className="container">
        <div className="mt-14 ml-5 text-center p-2">
          <h1 className="text-4xl font-Montserrat font-bold">Pircing</h1>
          <p className="font-Nunito mt-3 text-lg">
            Unlock value and find the perfect plan for your needs!
          </p>
        </div>
        <div className="flex w-full justify-center p-2">
          <div className="mt-10 border-purple-900 shadow-lg p-4 rounded-lg border-[1px] ">
            <h1 className="font-Geologica font-bold text-lg flex items-center gap-1">
              ₹ 100.00
            </h1>
            <p className="font-Montserrat">
              {" "}
              <span className="font-bold">5</span> Credits{" "}
            </p>
            <div className="select-none mt-6">
              <div className="flex items-center gap-2">
                <span
                  onClick={() => handleIncDec("dec")}
                  className="bg-gray-700 flex items-center p-2 cursor-pointer"
                >
                  {" "}
                  <MinusOutlined />
                </span>
                <input
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  type="number"
                  className="w-14 rounded p-1 text-center font-Geologica"
                  min={1}
                />
                <span
                  onClick={() => handleIncDec("inc")}
                  className="bg-gray-700 flex items-center p-2 cursor-pointer"
                >
                  {" "}
                  <PlusOutlined />
                </span>
              </div>
              <Link
                to="/payment"
                state={{
                  amount: count * 100,
                  count: count,
                }}
              >
                <button className="mt-3 font-Geologica outline-none border-[1px] border-purple-800 hover:bg-purple-800 hover:text-white  px-7 py-1 rounded-full">
                  Buy
                </button>
              </Link>
            </div>
            <div className="mt-10">
              <p className="font-Montserrat ">
                Use this credits to download the premium footages{" "}
              </p>
              <span className="font-Geologica text-sm">t&c apply</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
