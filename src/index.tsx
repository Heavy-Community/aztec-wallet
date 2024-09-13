import "react-toastify/dist/ReactToastify.css";
import * as ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import CreateAndDeploySchnorrAccount from "./pages/accounts";
import Transactions from "./pages/transactions";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Welcome to the Home Page</h1>} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/accounts" element={<CreateAndDeploySchnorrAccount />} />
      </Routes>
    </BrowserRouter>
    <ToastContainer />
  </>
);
