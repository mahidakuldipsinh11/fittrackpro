import React, { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import About from "./pages/About";
import Footer from "./context/Footer";
import { useLocation, useSearchParams } from "react-router-dom";

const SEO = () => (
  <div />
);

export default function AboutRouter() {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!user && !location.pathname.startsWith("/about")) {
      // no-op
    }
  }, [user]);

  return (
    <React.Fragment>
      <SEO />
      <About />
      <Footer />
    </React.Fragment>
  );
}
