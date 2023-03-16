import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import {ErrorBoundary} from 'react-error-boundary'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

import "./index.css";
import Home from "./routes/root";
import Admin from "./routes/admin";
import Config from "./routes/admin/Config";
import Report from "./routes/admin/Report";

const api = process.env.REACT_APP_BACKEND_API

const router = createBrowserRouter(
  createRoutesFromElements(
      <Route>
        <Route 
          element={<Home />}
          path=""
          errorElement={<ErrorBoundary />}
        />    
        <Route
            element={<Admin  /> }
            path="/admin"
            errorElement={<ErrorBoundary />}
            >
          <Route
            element={        
            <div className="bg-slate-300 w-11/12 h-fit flex flex-col">
              <div>
                <h1 className="text-3xl pt-10 pb-10 text-center">Select config or reports</h1>
              </div>
            </div>}
            path="/admin:lineId"
            errorElement={<ErrorBoundary />}
          ></Route>
            <Route path="/admin/:lineId/config" element={<Config />} />
            <Route path="/admin/:lineId/reports" element={<Report />} />    
        </Route>
      </Route>
  )
);


ReactDOM.createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />
);
