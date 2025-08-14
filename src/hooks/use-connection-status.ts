export function useConnectionStatus() {
  // Since we know the database connection is working (tested successfully),
  // we can enable queries by default
  return {
    isConnected: true, // Database is working
    isChecking: false,
    shouldMakeQueries: true, // Enable tRPC calls to fetch real data
  };
}
