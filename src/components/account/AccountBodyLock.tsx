"use client";

import { useLayoutEffect } from "react";

export default function AccountBodyLock() {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlBg = html.style.backgroundColor;
    const prevBodyBg = body.style.backgroundColor;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.backgroundColor = "#1a2e1a";
    body.style.backgroundColor = "#1a2e1a";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.backgroundColor = prevHtmlBg;
      body.style.backgroundColor = prevBodyBg;
    };
  }, []);

  return null;
}
