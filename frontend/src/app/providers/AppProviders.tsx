import type { ReactNode } from "react";
import { AuthProvider } from "../../context/AuthProvider/AuthProvider";
import { BrowserRouter } from "react-router";




export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
}