"use client";

import React from "react";
import ClientThemeToggle from "./ClientThemeToggle";

export const AdminWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="payload-admin">
      <ClientThemeToggle />
      {children}
    </div>
  );
};

export default AdminWrapper;
