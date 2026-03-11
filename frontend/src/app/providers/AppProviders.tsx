import type { ReactNode } from "react";
import { AuthProvider } from "../../context/AuthProvider/AuthProvider";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "../../context/ToastProvider/ToastProvider";




export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
