/**
 * WardContext — Global selected ward state.
 * Wrap the app in <WardProvider> and call useWard() anywhere to get/set the active ward.
 */
import React, { createContext, useContext, useState } from "react";
import { DEFAULT_WARD_ID } from "@/services/api-service";

interface WardContextValue {
  wardId: string;
  setWardId: (id: string) => void;
}

const WardContext = createContext<WardContextValue>({
  wardId: DEFAULT_WARD_ID,
  setWardId: () => {},
});

export function WardProvider({ children }: { children: React.ReactNode }) {
  const [wardId, setWardId] = useState(DEFAULT_WARD_ID);
  return (
    <WardContext.Provider value={{ wardId, setWardId }}>
      {children}
    </WardContext.Provider>
  );
}

export function useWard() {
  return useContext(WardContext);
}
