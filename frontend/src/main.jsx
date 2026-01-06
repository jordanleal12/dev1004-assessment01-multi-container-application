import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utilities/constants/queryClient";
import Modal from "react-modal";
import Header from "./components/NavbarHeader";
import { BrowserRouter } from "react-router-dom";
import Footer from "./components/Footer";
import AuthProvider from "./contexts/AuthProvider";
import { Toaster } from "react-hot-toast";
import ErrorFallback from "./components/common/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import BurgerMenu from "./components/BurgerMenu";

Modal.setAppElement("#root");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Error boundary catches unhandled child component errors, clears cache if triggered */}
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => queryClient.clear()}>
          <BrowserRouter>
            <Header />
            <div className="burger-menu-wrapper">
              <BurgerMenu />
            </div>
            <App />
            <Footer />
          </BrowserRouter>
        </ErrorBoundary>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { fontSize: "0.95rem" },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
