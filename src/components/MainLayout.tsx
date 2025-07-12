import React from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

import { getPageBackground } from "@/shared/config/colors";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
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
