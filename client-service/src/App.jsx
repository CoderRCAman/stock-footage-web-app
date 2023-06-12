import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { isAuthenticated } from "./utils/auth";
import Home from "./pages/Home/Home";
import StockImage from "./pages/StockImage/StockImage";
import StockVideo from "./pages/StockVideo/StockVideo";
import ResultImage from "./pages/ResultImage/ResultImage";
import ResultVideo from "./pages/ResultVideo/ResultVideo";
import Pricing from "./pages/Pricing/Pricing";
import Profile from "./pages/Profile/Profile";
import { SnackbarProvider } from "notistack";
import useInitHook from "./hooks/useInitiHooks";
import { useSelector } from "react-redux";
import RecommendModal from "./components/RecommendModal/RecommendModal";
import ImageProduct from "./pages/ImageProduct/ImageProduct";
import VideoProduct from "./pages/VideoProduct/VideoProduct";
import Payment from "./pages/Payment/Payment";
import PaymentSuccess from "./pages/Payment/PaymentSuccess";
export default function App() {
  useInitHook();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (user?.recommend) {
      window.my_modal_3.close();
      window.my_modal_3.showModal();
    }
    if (!user?.recommend) {
      window.my_modal_3.close();
    }
  }, [user, user?.recommend]);
  return (
    <SnackbarProvider>
      {<RecommendModal />}
      <Router>
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated() ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/signup"
            element={isAuthenticated() ? <Navigate to="/" /> : <Signup />}
          />
          <Route path="/" element={<Home />} />
          <Route path="/stock-image" element={<StockImage />} />
          <Route path="/stock-video" element={<StockVideo />} />
          <Route path="/result-image" element={<ResultImage />} />
          <Route path="/result-video" element={<ResultVideo />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route
            path="/profile"
            element={isAuthenticated() ? <Profile /> : <Navigate to="/" />}
          />
          <Route path="/image/" element={<ImageProduct />} />
          <Route path="/video/" element={<VideoProduct />} />
          <Route
            path="/payment/"
            element={isAuthenticated() ? <Payment /> : <Navigate to="/login" />}
          />
          <Route
            path="/payment-success/"
            element={isAuthenticated() ? <PaymentSuccess /> : <Navigate to="/login" />}
          />
          
        </Routes>
      </Router>
    </SnackbarProvider>
  );
}
