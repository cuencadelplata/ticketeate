"use client";
import React from "react";
import Image from "next/image";

const DarkMode = () => {
  const [theme, setTheme] = React.useState<"light" | "dark">(
    (typeof window !== "undefined" && (localStorage.getItem("theme") as "light" | "dark")) || "light"
  );

  const element = typeof document !== "undefined" ? document.documentElement : null;

  React.useEffect(() => {
    if (!element) return;

    if (theme === "dark") {
      element.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      element.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme, element]);

  return (
    <div className="relative">
    
      {/* Botón Light */}
       <Image
        src="/light-mode-button.png" 
        alt="Light mode"
        width={48}
        height={48}
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className={`w-12 cursor-pointer transition-all duration-300 absolute right-0 z-10 ${
          theme === "dark" ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Botón Dark */}
        <Image
         src="/dark-mode-button.png" 
        alt="Dark mode"
        width={48}
        height={48}
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="w-12 cursor-pointer transition-all duration-300"
      />
    </div>
  );
};

export default DarkMode;
