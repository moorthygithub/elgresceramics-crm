import { Route, Routes } from "react-router-dom";

import StockView from "@/app/stockView/StockView";

import AuthRoute from "./AuthRoute";
import Login from "@/app/auth/Login";
import ForgotPassword from "@/components/ForgotPassword/ForgotPassword";
import Maintenance from "@/components/common/Maintenance";
import ProtectedRoute from "./ProtectedRoute";

import BuyerList from "@/app/master/buyer/BuyerList";
import ItemList from "@/app/master/item/ItemList";
import CategoryList from "@/app/master/category/CategoryList";
import PurchaseList from "@/app/purchase/PurchaseList";
import CreatePurchase from "@/app/purchase/CreatePurchase";
import EditPurchase from "@/app/purchase/EditPurchase";
import SalesList from "@/app/sales/SalesList";
import CreateSales from "@/app/sales/CreateSales";
import EditSales from "@/app/sales/EditSales";
import SalesView from "@/app/sales/SalesView";
import Stock from "@/app/report/Stock";
import BuyerReport from "@/app/report/BuyerReport";
import NotFound from "@/app/errors/NotFound";
import Home from "@/app/home/Home";
import SingleItemStock from "@/app/report/SingleItemStock";
import PurchaseReport from "@/app/report/PurchaseReport";
import DispatchReport from "@/app/report/DispatchReport";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthRoute />}>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/maintenance" element={<Maintenance />} />
      </Route>

      <Route path="/" element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/master/buyer" element={<BuyerList />} />
        <Route path="/master/item" element={<ItemList />} />
        <Route path="/master/category" element={<CategoryList />} />
        <Route path="/stock-view" element={<StockView />} />
        <Route path="/purchase" element={<PurchaseList />} />
        <Route path="/purchase/create" element={<CreatePurchase />} />
        <Route path="/purchase/edit/:id" element={<EditPurchase />} />
        <Route path="/dispatch" element={<SalesList />} />
        <Route path="/dispatch/create" element={<CreateSales />} />
        <Route path="/dispatch/edit/:id" element={<EditSales />} />
        <Route path="/dispatch/view/:id" element={<SalesView />} />
        <Route path="/report/stock" element={<Stock />} />
        <Route path="/report/buyer" element={<BuyerReport />} />
        <Route path="/report/single-item-stock" element={<SingleItemStock />} />
        <Route path="/report/purchase" element={<PurchaseReport />} />
        <Route path="/report/dispatch" element={<DispatchReport />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
