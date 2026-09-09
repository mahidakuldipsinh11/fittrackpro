import React, { useEffect, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AboutViewer.css";

export default function AboutViewer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const activeTabRef = useRef("");

  useEffect(() => {
    popupRef.current = window.open(
      "about:blank",
      "fittrackAboutViewer",
      "width=820,height=640,toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1"
    );
    if (!popupRef.current) return;

    const token = localStorage.getItem("fittrack_token");
    const dest = "/about";

    popupRef.current.document.open();
    popupRef.current.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>FitTrack PRO — About</title>
        <link rel="stylesheet" href="/assets/index.css">
      </head>
      <body>
        <div id="root"></div>
        <script async src="/assets/index.es.js"></script>
        <script>
          window.__fittrackViewer = {
            dest: ${JSON.stringify(dest)},
            token: ${JSON.stringify(token)},
            opener: window.opener
          };
        </script>
      </body>
      </html>
    `);
    popupRef.current.document.close();

    const handleMessage = (e) => {
      if (e.data && e.data.type === "fittrack:activetab") {
        activeTabRef.current = e.data.tabId || "";
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      try { popupRef.current && popupRef.current.close(); } catch (e) {}
      popupRef.current = null;
    };
  }, []);

  const open = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }
    window.location.href = "/about";
  };

  return (
    <div className="aboutViewer">
      <div className="aboutViewer__inner">
        <div className="aboutViewer__icon">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect width="44" height="44" rx="10" fill="#1A1A1A" />
            <rect x="2" y="2" width="40" height="40" rx="9" stroke="#C8A951" strokeWidth="1.5" fill="none" />
            <path d="M11 22c0-3 2-6 4-6 2 0 4 2 4 6 0 4 2 8 4 8 2 0 4-4 4-8 2 0 4-2 4-6 2 0 4 3 4 6z" fill="#C8A951" />
            <circle cx="22" cy="22" r="2.5" fill="#FFFDF5" />
          </svg>
        </div>
        <div className="aboutViewer__content">
          <p className="aboutViewer__title">About FitTrack PRO</p>
          <p className="aboutViewer__sub">
            Shop Analytics, Team, Testimonials & Mission — all from the live backend.
          </p>
          <button
            className="aboutViewer__btn"
            onClick={open}
          >
            {popupRef.current && !popupRef.current.closed
              ? "Open in popup"
              : "Open in new tab"}
          </button>
        </div>
      </div>
    </div>
  );
}
