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
      navigate('/dashboard');
    }
    setSelectedOption({
      value: (user as User)?.name,
      label: (user as User)?.name
    });
  };

  useEffect(() => {
    if (user) {
      setOptions([
        {
          value: (user as User)?.name ? (user as User)?.name : '',
          label: (user as User)?.name && (user as User)?.name
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
        styles={selectStyles}
      />
    </div>
  );
};

export default UserDropdown;
