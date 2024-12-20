import Select, { GroupBase } from 'react-select';
import selectStyles, { OptionType } from '../formElements/Select.styles';
import { useEffect, useState } from 'react';
import { UserType as User } from '../../types/databaseTypes';
import { useNavigate } from 'react-router-dom';

/**
 * Defines the properties for the UserDropdown component
 *
 * @interface UserDropdownProps
 * @property {User | null | Record<string, never>} user - The current user object
 */
interface UserDropdownProps {
  user: User | null | Record<string, never>;
}

/**
 * Renders an interactive dropdown menu for user-related actions
 *
 * @component
 * @param {UserDropdownProps} props - The properties for the UserDropdown
 * @returns {JSX.Element} A styled dropdown with user-specific navigation options
 *
 * @example
 * <UserDropdown user={currentUser} />
 *
 * @remarks
 * - Dynamically generates options based on user object
 * - Provides navigation to Dashboard, Edit Interests, Change Password, and Logout
 * - Responsive design with mobile-friendly option labels
 * - Intelligent menu positioning based on screen width
 */
const UserDropdown = ({ user }: UserDropdownProps) => {
  /**
   * Navigation hook from React Router for programmatic routing
   * @type {Function}
   */
  const navigate = useNavigate();

  /**
   * State to manage dropdown options
   * @type {OptionType[]}
   */
  const [options, setOptions] = useState<OptionType[]>([]);

  /**
   * State to track the currently selected dropdown option
   * @type {OptionType | null}
   */
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(
    options[0]
  );

  /**
   * State to manage dropdown menu positioning
   * @type {Object}
   * @property {string | number} left - Left positioning value
   * @property {string | number} right - Right positioning value
   */
  const [menuPosition, setMenuPosition] = useState<{
    left: string | number;
    right: string | number;
  }>({
    left: 'auto',
    right: 0
  });

  /**
   * Handles user dropdown selection and navigation
   *
   * @param {OptionType | null} selected - The selected dropdown option
   * @description Navigates to different routes based on selected option
   */
  const handleUserDropdownChanged = (selected: OptionType | null) => {
    if (selected?.value === 'Log Out') {
      navigate('/logout');
    } else if (selected?.value === 'Edit Interests') {
      navigate('/editinterest');
    } else if (selected?.value === 'Change Password') {
      navigate('/changePassword');
    } else if (selected?.value === 'Dashboard') {
      navigate('/dashboard/home');
    }
    setSelectedOption(options[0]);
  };

  /**
   * Adjusts dropdown menu positioning based on screen width
   *
   * @description Ensures the dropdown menu is fully visible on different screen sizes
   */
  const handleMenuOpen = () => {
    const menuWidth = 200; // Set this to your minWidth
    const rect = document
      .querySelector('.react-select__control')
      ?.getBoundingClientRect();

    if (rect) {
      const rightEdge = rect.right + menuWidth;

      if (rightEdge > window.innerWidth) {
        setMenuPosition({ left: 'auto', right: '0' }); // Align to the right
      } else {
        setMenuPosition({ left: '0', right: 'auto' }); // Default position
      }
    }
  };

  /**
   * Creates dropdown options based on user object and screen width
   *
   * @description Dynamically generates user-specific dropdown options
   */
  const createOptionList = () => {
    if (user) {
      setOptions([
        {
          value: (user as User)?.name ? (user as User)?.name : '',
          label:
            window.innerWidth > 600
              ? (user as User)?.name && (user as User)?.name
              : 'Me'
        },
        {
          value: 'Dashboard',
          label: 'Dashboard'
        },
        {
          value: 'Edit Interests',
          label: 'Edit Interests'
        },
        {
          value: 'Change Password',
          label: 'Change Password'
        },
        {
          value: 'Log Out',
          label: 'Log Out'
        }
      ]);
    }
  };

  /**
   * Attaches resize event listener to update option list
   */
  window.onresize = createOptionList;

  /**
   * Generates option list when user changes
   * @effect
   */
  useEffect(createOptionList, [user]);

  /**
   * Resets selected option when options change
   * @effect
   */
  useEffect(() => {
    if (options.length > 0) {
      setSelectedOption(options[0]);
    }
  }, [options]);

  return (
    <div className='flex items-center justify-center'>
      <Select<OptionType, false, GroupBase<OptionType>>
        options={options}
        onChange={handleUserDropdownChanged}
        value={selectedOption}
        name='user'
        styles={{
          ...selectStyles,
          menu: (base) => ({
            ...base,
            ...(selectStyles.menu !== undefined
              ? (selectStyles.menu as () => object)
              : () => ({}))(),
            ...menuPosition,
            minWidth: '200px'
          })
        }}
        menuPortalTarget={document.body}
        menuPosition='absolute'
        onMenuOpen={handleMenuOpen}
      />
    </div>
  );
};

export default UserDropdown;
