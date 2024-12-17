import React, { createContext, useState, useContext, ReactNode } from 'react';
import { SchoolListType } from '../types/databaseTypes';

// Define the context type
type SchoolContextType = {
  currentSchool: SchoolListType | null;
  setCurrentSchool: (school: SchoolListType | null) => void;
  route: string | null;
  setRoute: (route: string | null) => void;
};

// Create the context
const SchoolContext = createContext<SchoolContextType>({
  currentSchool: null,
  setCurrentSchool: () => {},
  route: null,
  setRoute: () => {}
});

// Context Provider component
export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSchool, setCurrentSchool] = useState<SchoolListType | null>(null);
  const [route, setRoute] = useState<string | null>(null);

  return (
    <SchoolContext.Provider value={{ currentSchool, setCurrentSchool, route, setRoute }}>
      {children}
    </SchoolContext.Provider>
  );
};

// Custom hook to use the school context
export const useSchool = () => useContext(SchoolContext);
