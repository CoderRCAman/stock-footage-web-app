import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BarLoader } from "react-spinners";

const urlParams = new URLSearchParams(window.location.search);
const payment_intent = urlParams.get("payment_intent");
export default function PaymentSuccess() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    msg: "",
    error: "",
  });
  useEffect(() => {
    async function UpdatePayment() {
     
      try {
        const res = await axios.post(
          "http://localhost:4269/api/v1/add-payments",
          {
            payment_intent: payment_intent,
            status: true,
          },
          {
            withCredentials: true,
          }
        );
        if (res.status == 200) {
          setLoading(false);
          setMessage({
            msg: "Payment was successfull Thank you 🥳",
            error: "",
          });
        }
      } catch (error) {
        setLoading(false);
        setMessage({
          msg: "",
          error: error?.response?.data?.msg || "Something went wrong!",
        });
      }
    }
    UpdatePayment();
    
  }, []);
  return (
    <div className="h-screen w-full flex justify-center flex-col items-center">
      {loading ? (
        <BarLoader />
      ) : (
        <>
          {message.msg ? (
            <h1 className="text-emerald-500 text-3xl font-semibold text-center">
              {message.msg}
            </h1>
          ) : (
            <h1 className="text-rose-600 text-3xl font-semibold text-center">
              {message.error}
            </h1>
          )}
          <Link to="/">
            <button className="btn btn-secondary btn-sm mt-5 btn-outline ">
              Home
            </button>
          </Link>
        </>
      )}
    </div>
  );
}
