import { Navigate, type RouteObject } from "react-router-dom";
import { createBrowserRouter } from 'react-router-dom';
import { lazy } from "react";
import ErrorPage from "@/layouts/commonPage/exception/500";
import Layout from "@/layouts";
import { BankOutlined, GatewayOutlined } from "@ant-design/icons";

export const pageRoutes = [
    {
      name: "基础",
      path: "/basic",
      icon: <BankOutlined />,
      Component: lazy(() => import("@/pages/basic")),
    },
    {
      name: "图片识图",
      path: "/image-recognition",
      icon: <GatewayOutlined />,
      Component: lazy(() => import("@/pages/image-recognition")),
    },
  ];
  export const routes: RouteObject[] = [
    {
      path: "/",
      element: (
          <Layout />
      ),
      children: [
        {
          path: "/",
          element: <Navigate to="/basic" />,
        },
        ...pageRoutes,
      ],
    },
    {
      path: "*",
      errorElement: <ErrorPage />,
    },
  ];
  

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter(routes);
