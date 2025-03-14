import React, { useState, useEffect } from 'react';
import logo from '../../../assets/logo.png';
import { useSchool } from '../../contexts/SchoolContext';
import { useLocation } from 'react-router';

// Pre-import all logo images
const logoModules = import.meta.glob('../../../assets/logo/logo-*.png');

export const DynamicLogo: React.FC = () => {
  const [dayLogo, setDayLogo] = useState(logo);
  const { currentSchool } = useSchool();
  const location = useLocation();

  useEffect(() => {
    if (currentSchool?.logo && location?.pathname !== '/') {
      setDayLogo(currentSchool.logo);
      return;
    }
    const currentDay = new Date().getDate();
    const expectedLogoPath = `../../../assets/logo/logo-${currentDay}.png`;

    const matchingLogoModule = Object.keys(logoModules).find(
      (path) => path === expectedLogoPath
    );

    if (matchingLogoModule) {
      logoModules[matchingLogoModule]().then((module) => {
        setDayLogo((module as any)?.default);
      });
    }
  }, [currentSchool, location]);

  return <img src={dayLogo} className='h-[100%]' />;
};
