"use client";

import dynamic from "next/dynamic";
import React from "react";

const ThemeToggle = dynamic(() => import("./ThemeToggle"), {
  ssr: false,
  loading: () => null,
});

export const ClientThemeToggle: React.FC = () => {
  return <ThemeToggle />;
};

export default ClientThemeToggle;
