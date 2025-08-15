/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";
import React from "react";

import { importMap } from "./admin/importMap.js";
import "./custom.scss";

// Import module shims to handle Node.js modules in browser
import "./admin/components/ModuleShims";

// Import theme injector
import ThemeInjector from "./admin/components/ThemeInjector";

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <>
    <ThemeInjector />
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  </>
);

export default Layout;
