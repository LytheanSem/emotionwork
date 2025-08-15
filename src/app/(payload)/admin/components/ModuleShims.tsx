// Module shims to replace Node.js modules that aren't available in the browser
// This helps avoid the worker_threads and pino import issues

// Extend Window interface to include our custom properties
declare global {
  interface Window {
    worker_threads: {
      parentPort: null;
      workerData: null;
    };
    pino: () => {
      info: () => void;
      error: () => void;
      warn: () => void;
      debug: () => void;
    };
    "pino-pretty": () => void;
    "pino-abstract-transport": Record<string, unknown>;
  }
}

// Shim for worker_threads
if (typeof window !== "undefined") {
  window.worker_threads = {
    parentPort: null,
    workerData: null,
  };
}

// Shim for pino logging
if (typeof window !== "undefined") {
  window.pino = () => ({
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {},
  });

  window["pino-pretty"] = () => {};
  window["pino-abstract-transport"] = {};
}

export {};
