import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "./CheckoutForm.jsx";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripePromise = loadStripe(
  "pk_test_51NHttWSBHFic1op0NCcLpukyFEv5KIq0mSarO7Pe9pj8AqJQC5fgUkUpnxxBMxILZ9EQdu5OU3pj67GLS7sT62EY0035UDOG9L"
);

export default function Payment() {
  const [clientSecret, setClientSecret] = useState("");
  const { state } = useLocation();
  useEffect(() => {
    // Create PaymentIntent as soon as the page loads 
    history.replaceState({},'','/pricing')
    async function getCurrentKey() {
      try {
        const res = await axios.post(
          "http://localhost:4269/api/v1/create-payment-intent",
          {
            amount: state.amount,
            credits: state.count,
          },
          {
            withCredentials: true,
          }
        );
        return setClientSecret(res.data.ClientSecret);
      } catch (error) {
        console.log(error);
      }
    }
    getCurrentKey();
  }, []);

  const appearance = {
    theme: "night",
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}
