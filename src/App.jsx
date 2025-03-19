import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./app/auth/Login";
import { Toaster } from "./components/ui/toaster";
import Home from "./app/home/Home";
import BuyerList from "./app/master/buyer/BuyerList";
import CategoryList from "./app/master/category/CategoryList";
import ItemList from "./app/master/item/ItemList";
import CreatePurchase from "./app/purchase/CreatePurchase";
import EditPurchase from "./app/purchase/EditPurchase";
import PurchaseList from "./app/purchase/PurchaseList";
import CreateSales from "./app/sales/CreateSales";
import EditSales from "./app/sales/EditSales";
import SalesList from "./app/sales/SalesList";
import BuyerReport from "./app/report/BuyerReport";
import Stock from "./app/report/Stock";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import SessionTimeoutTracker from "./components/SessionTimeoutTracker/SessionTimeoutTracker";
import DisabledRightClick from "./components/common/DisabledRightClick";
import SalesView from "./app/sales/SalesView";
import Maintenance from "./components/common/Maintenance";

function App() {
  const navigate = useNavigate();
  const time = localStorage.getItem("token-expire-time");
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };
  return (
    <>
      {/* <DisabledRightClick /> */}
      <Toaster />
      <SessionTimeoutTracker expiryTime={time} onLogout={handleLogout} />
      <Routes>
        {/* Login Page        */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/maintenance" element={<Maintenance />} />
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
        <Route path="/purchase" element={<PurchaseList />} />
        <Route path="/purchase/create" element={<CreatePurchase />} />
        <Route path="/purchase/edit/:id" element={<EditPurchase />} />
        {/* ----------------->Sales*/}
        <Route path="/dispatch" element={<SalesList />} />
        <Route path="/dispatch/create" element={<CreateSales />} />
        <Route path="/dispatch/edit/:id" element={<EditSales />} />
        <Route path="/dispatch/view/:id" element={<SalesView />} />
        {/* ------------------------Report---------------------------- */}
        <Route path="/report/stock" element={<Stock />} />
        <Route path="/report/buyer" element={<BuyerReport />} />
      </Routes>
    </>
  );
}

export default App;
