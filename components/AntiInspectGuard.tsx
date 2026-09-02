"use client";

import { useEffect } from "react";

export default function AntiInspectGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Disable Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable DevTools & Inspection Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + I (Inspect)
      // Ctrl + Shift + J (Console)
      // Ctrl + Shift + C (Inspect Element)
      // Ctrl + Shift + K (Firefox Console)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "I" ||
          e.key === "i" ||
          e.key === "J" ||
          e.key === "j" ||
          e.key === "C" ||
          e.key === "c" ||
          e.key === "K" ||
          e.key === "k")
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U / Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S / Cmd + S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + P / Cmd + P (Print Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Clear Console & Overwrite console methods in production
    const disableConsole = () => {
      if (process.env.NODE_ENV === "production") {
        try {
          const noop = () => {};
          window.console.log = noop;
          window.console.info = noop;
          window.console.warn = noop;
          window.console.error = noop;
          window.console.debug = noop;
          window.console.table = noop;
        } catch {}
      }
    };

    // 4. DevTools Open Detection via Screen Delta
    const checkDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        // DevTools opened or undocked
        console.clear();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("resize", checkDevTools);
    
    disableConsole();

    const devtoolsInterval = setInterval(checkDevTools, 1000);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("resize", checkDevTools);
      clearInterval(devtoolsInterval);
    };
  }, []);

  return null;
}
