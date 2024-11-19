const generateStyleClasses = (
  color: string,
  filled: boolean,
  disabled?: boolean
) => {
  const baseClasses = 'p-2 rounded-lg w-full transition duration-200';
  const filledClasses = `bg-${color}-${
    disabled ? 800 : 950
  } hover:bg-${color}-900 active:bg-${color}-800 ${
    disabled ? 'text-gray-500' : 'text-white'
  }`;
  const outlinedClasses = `border-2 border-${color}-950 text-${color}-950 hover:text-${color}-900 hover:border-${color}-900 active:text-${color}-800 active:border-${color}-800`;

  return `${baseClasses} ${filled ? filledClasses : outlinedClasses}`;
};

export default generateStyleClasses;
