import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import ReactDOM from "react-dom/client";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/:id",
    element: <App />,
  },
]);

const root = document.getElementById("root");
ReactDOM.createRoot(root!).render(<RouterProvider router={router} />);
