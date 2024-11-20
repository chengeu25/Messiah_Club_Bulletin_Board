import Select, { GroupBase } from 'react-select';
import selectStyles, { OptionType } from '../formElements/Select.styles';
import { useEffect, useState } from 'react';
import { User } from '../../helper/checkUser';
import { useNavigate } from 'react-router-dom';

interface UserDropdownProps {
  user: User | null | Record<string, never>;
}

const UserDropdown = ({ user }: UserDropdownProps) => {
  const navigate = useNavigate();

  const [options, setOptions] = useState<OptionType[]>([]);
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(
    options[0]
  );
  const [menuPosition, setMenuPosition] = useState<{
    left: string | number;
    right: string | number;
  }>({
    left: 'auto',
    right: 0
  });

  /**
   * Handles the user dropdown change event. If the selected option is
   * 'Log Out', navigates to the logout route. If the selected option is
   * 'Edit Interests', navigates to the edit interest route. If the selected
   * option is 'Change Password', navigates to the change password route. If the
   * selected option is 'Dashboard', navigates to the dashboard route.
   * @param {OptionType | null} selected - The selected option.
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
   * Handles the user dropdown open event. Adjusts the position of the menu
   * depending on the right edge of the button and the window width.
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

  useEffect(() => {
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
  }, [user]);

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
            ...(selectStyles.menu as () => object)(),
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
