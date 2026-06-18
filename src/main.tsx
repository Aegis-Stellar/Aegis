import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import "./index.css"

import { AppLayout, LandingLayout } from "@/components/layout/Layout"
import { WalletGate } from "@/components/layout/WalletGate"
import { Landing } from "@/pages/Landing"
import { CreateSafe } from "@/pages/CreateSafe"
import { MySafes } from "@/pages/MySafes"
import { SafeDetail } from "@/pages/SafeDetail"
import { ProposeTransaction } from "@/pages/ProposeTransaction"
import { TransactionDetail } from "@/pages/TransactionDetail"
import { SafeSettings } from "@/pages/SafeSettings"

const gated = (el: React.ReactNode) => <WalletGate>{el}</WalletGate>

const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    children: [{ path: "/", element: <Landing /> }],
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/app/safes", element: gated(<MySafes />) },
      { path: "/app/create", element: gated(<CreateSafe />) },
      { path: "/app/safe/:id", element: gated(<SafeDetail />) },
      { path: "/app/safe/:id/propose", element: gated(<ProposeTransaction />) },
      { path: "/app/safe/:id/tx/:txId", element: gated(<TransactionDetail />) },
      { path: "/app/safe/:id/settings", element: gated(<SafeSettings />) },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
