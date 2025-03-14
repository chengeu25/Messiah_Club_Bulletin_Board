import React from 'react';
import SidebarButton from './SidebarButton.component';

/**
 * Represents the structure of a sidebar button
 *
 * @interface SidebarButtonConfig
 * @property {string} text - The display text for the sidebar button
 * @property {React.ReactNode} icon - The icon component for the button
 * @property {string} route - The navigation route when the button is clicked
 * @property {SidebarButtonConfig[]} buttonList - The list of buttons to display in the sidebar
 */
interface SidebarButtonConfig {
  text: string;
  icon: React.ReactNode;
  route: string;
}

/**
 * Renders a dynamic sidebar with navigation buttons
 *
 * @component
 * @description Creates a sidebar that adapts its buttons based on user role
 * @returns {JSX.Element} A sidebar with dynamically generated navigation buttons
 *
 * @example
 * // Renders a sidebar with default buttons for students
 * <Sidebar />
 *
 * @remarks
 * - Dynamically adds a 'Faculty' button for faculty users
 * - Uses React hooks to manage button list and user role
 * - Integrates with checkUser helper to determine user type
 * - Renders SidebarButton components with icons and routes
 */
const Sidebar = ({ buttonList }: { buttonList: SidebarButtonConfig[] }) => {
  return (
    <>
      {buttonList.map((button) => (
        <React.Fragment key={button.text}>
          <SidebarButton
            text={button.text}
            icon={button.icon as JSX.Element}
            route={button.route}
          />
          <hr />
        </React.Fragment>
      ))}
    </>
  );
};

export default Sidebar;
