import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { isLoggedIn } from "./utils/auth";
import LoginPage from "components/LoginPage";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  const RootComponent = () => {
    return isLoggedIn() ? <App /> : <LoginPage />;
  };

  root.render(
    <React.StrictMode>
      <RootComponent />
    </React.StrictMode>,
  );
}
