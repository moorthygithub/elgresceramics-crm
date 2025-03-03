import Login from "./app/auth/Login";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./app/home/Home";
import BASE_URL from "./config/BaseUrl";
import SessionTimeoutTracker from "./components/SessionTimeoutTracker/SessionTimeoutTracker";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import BuyerList from "./app/master/buyer/BuyerList";
import ItemList from "./app/master/item/ItemList";
import CategoryList from "./app/master/category/CategoryList";
import PurchaseList from "./app/master/purchase/PurchaseList";
import CreatePurchase from "./app/master/purchase/CreatePurchase";
import EditPurchase from "./app/master/purchase/EditPurchase";
import SalesList from "./app/master/sales/SalesList";
import CreateSales from "./app/master/sales/CreateSales";
import EditSales from "./app/master/sales/EditSales";
import Stock from "./app/report/Stock";
import BuyerReport from "./app/report/BuyerReport";

// const queryClient = new QueryClient();

function App() {
  const navigate = useNavigate();
  const time = localStorage.getItem("token-expire-time");

  return (
    <>
      <Toaster />
      {/* <SessionTimeoutTracker expiryTime={time} onLogout={handleLogout} /> */}
      <Routes>
        {/* Login Page        */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Dashboard  */}
        <Route path="/home" element={<Home />} />
        {/* ----------------------Master------------------------------ */}
        {/* ----------------->Buyer */}
        <Route path="/master/buyer" element={<BuyerList />} />
        {/* ----------------->Item */}
        <Route path="/master/item" element={<ItemList />} />
        {/* ----------------->Category*/}
        <Route path="/master/category" element={<CategoryList />} />
        {/* ----------------->Purchase*/}
        <Route path="/master/purchase" element={<PurchaseList />} />
        <Route path="/master/purchase/create" element={<CreatePurchase />} />
        <Route path="/master/purchase/edit/:id" element={<EditPurchase />} />
        {/* ----------------->Sales*/}
        <Route path="/master/sales" element={<SalesList />} />
        <Route path="/master/sales/create" element={<CreateSales />} />
        <Route path="/master/sales/edit/:id" element={<EditSales />} />
        {/* ------------------------Report---------------------------- */}
        <Route path="/report/stock" element={<Stock />} />
        <Route path="/report/buyer" element={<BuyerReport />} />
      </Routes>
    </>
  );
}

export default App;
