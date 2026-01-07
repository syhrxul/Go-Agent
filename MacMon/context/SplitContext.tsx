import React, { createContext, useContext, useState } from 'react';

type SplitContextType = {
  isSplitMode: boolean;
  setSplitMode: (value: boolean) => void;
};

const SplitContext = createContext<SplitContextType>({
  isSplitMode: false,
  setSplitMode: () => {},
});

export const useSplitScreen = () => useContext(SplitContext);

export const SplitScreenProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSplitMode, setSplitMode] = useState(false);

  return (
    <SplitContext.Provider value={{ isSplitMode, setSplitMode }}>
      {children}
    </SplitContext.Provider>
  );
};