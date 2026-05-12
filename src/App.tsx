/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProductProvider } from "./context/ProductContext";
import { Dashboard } from "./pages/Dashboard";
import { Financials } from "./pages/Financials";
import { POS } from "./pages/POS";
import { Inventory } from "./pages/Inventory";
import { Settings } from "./pages/Settings";
import { Roles } from "./pages/Roles";
import { Billing } from "./pages/Billing";
import { Clients } from "./pages/Clients";

export default function App() {
  return (
    <ProductProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
          <Route path="/settings/:tab" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </ProductProvider>
  );
}
