/**
 * Sets the CSS variables for a given color.
 * @param color The color to set the CSS variables for
 */
const setCSSVars = (color: string) => {
  const mainColor = '#' + (color === '' ? '000000' : color);
  const r = parseInt(mainColor?.substring(1, 3) ?? '00', 16);
  const g = parseInt(mainColor?.substring(3, 5) ?? '00', 16);
  const b = parseInt(mainColor?.substring(5, 7) ?? '00', 16);

  document.documentElement.style.setProperty(
    '--foreground-rgb',
    `rgb(${r}, ${g}, ${b})`
  );

  document.documentElement.style.setProperty(
    '--hover-rgb',
    `rgb(${r - 10}, ${g - 10}, ${b - 10})`
  );

  document.documentElement.style.setProperty(
    '--active-rgb',
    `rgb(${r - 20}, ${g - 20}, ${b - 20})`
  );

  document.documentElement.style.setProperty(
    '--tag-rgb',
    `rgb(${Math.min(r + 100, 255)}, ${Math.min(g + 100, 255)}, ${Math.min(
      b + 100,
      255
    )})`
  );
};

export default setCSSVars;
