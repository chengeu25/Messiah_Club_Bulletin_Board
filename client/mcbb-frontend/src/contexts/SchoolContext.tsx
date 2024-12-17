import React, { createContext, useState, useContext, ReactNode } from 'react';
import { SchoolType } from '../types/databaseTypes';
import setCSSVars from '../helper/setCSSVars';

// Define the context type
type SchoolContextType = {
  currentSchool: SchoolType | null;
  setCurrentSchool: (school: SchoolType | null) => void;
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
export const SchoolProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [currentSchool, setCurrentSchoolValue] = useState<SchoolType | null>(
    null
  );
  const setCurrentSchool = (value: SchoolType | null) => {
    setCurrentSchoolValue(value);
    setCSSVars(value?.color ?? '');
  };
  const [route, setRoute] = useState<string | null>(null);

  return (
    <SchoolContext.Provider
      value={{ currentSchool, setCurrentSchool, route, setRoute }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

// Custom hook to use the school context
export const useSchool = () => useContext(SchoolContext);
