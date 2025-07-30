// "use client";

import React from "react";

// import { useSelector } from "react-redux";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

// import {
//   selectIsAuthenticated,
//   selectAuthLoading,
//   selectUser,
// } from "@/entities/user/model/selectors";

import { getPageBackground } from "@/shared/config/colors";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // const isAuthenticated = useSelector(selectIsAuthenticated);
  // const isLoading = useSelector(selectAuthLoading);
  // const user = useSelector(selectUser);

  // You can now use these values:
  // - isAuthenticated: boolean - true if user is logged in
  // - isLoading: boolean - true if auth is still loading
  // - user: User | null - user object with details

  return (
    <>
      <Header />
      <main className={`min-h-screen px-4 pt-24 ${getPageBackground()}`}>
        {children}
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
