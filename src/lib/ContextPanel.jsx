import { createContext, useEffect, useState } from "react";

export const ContextPanel = createContext();

const AppProvider = ({ children }) => {
  return <ContextPanel.Provider value={{}}>{children}</ContextPanel.Provider>;
};

export default AppProvider;
