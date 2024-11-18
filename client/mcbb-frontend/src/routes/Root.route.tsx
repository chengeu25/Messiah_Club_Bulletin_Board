import {
  Outlet,
  useLoaderData,
  useNavigate,
  Link,
  useLocation
} from 'react-router-dom';
import Button from '../components/formElements/Button.component';
import Input from '../components/formElements/Input.component';
import Select from '../components/formElements/Select.component';
import CSelect, { GroupBase } from 'react-select';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { BiHome } from 'react-icons/bi';
import {
  getMonthName,
  getMostRecentSunday,
  getNextSaturday
} from '../helper/dateUtils';
import { User } from '../helper/checkUser';
import { useEffect, useState } from 'react';

interface OptionType {
  value: string;
  label: string;
}

const Root = () => {
  const user = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();

  const [options, setOptions] = useState<OptionType[]>([]);

  const [selectedOption, setSelectedOption] = useState<OptionType | null>(
    options[0]
  );

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
    <div className='w-screen h-screen flex flex-col relative bg-gray-100'>
      <nav className='w-full h-20 sm:min-h-[10%] bg-blue-950 text-white p-3 shadow-md relative flex justify-between items-center gap-6'>
        <span className='text-xl h-full'>
          <Link to='/' className='h-full'>
            <img src='../../assets/logo.png' className='h-[100%]' />
          </Link>
        </span>
        {location.pathname.includes('/dashboard') &&
        !location.pathname.includes('/home') ? (
          <div className='flex flex-row gap-6 flex-grow items-center justify-center'>
            <Input
              label={`Search for ${
                location.pathname.split('/')[
                  location.pathname.split('/').length - 1
                ] === 'clubs'
                  ? 'Clubs'
                  : 'Events'
              }`}
              name='search'
              type='text'
              color='blue'
              placeholder='Search'
              filled={false}
            />
            <Select
              options={[
                'All',
                'Suggested',
                location.pathname.includes('/clubs')
                  ? 'Subscribed'
                  : 'Hosted by Subscribed Clubs',
                ...(location.pathname.includes('/calendar')
                  ? ['Attending']
                  : [])
              ]}
              label='Filter'
              color='white'
              filled={false}
            />
            {location.pathname.includes('/calendar') && (
              <div className='flex flex-row gap-2 h-full justify-center items-center'>
                <Button
                  icon={<BiHome />}
                  color='white'
                  filled={false}
                  className='p-2 h-full'
                />
                <Button
                  icon={<IoIosArrowBack />}
                  color='white'
                  filled={false}
                  className='p-2 h-full'
                />
                <p className='text-nowrap'>{`${getMonthName(
                  new Date()
                )} ${getMostRecentSunday(
                  new Date()
                ).getDate()} - ${getNextSaturday(
                  new Date()
                ).getDate()}, ${new Date().getFullYear()}`}</p>
                <Button
                  icon={<IoIosArrowForward />}
                  color='white'
                  filled={false}
                  className='p-2 h-full'
                />
              </div>
            )}
          </div>
        ) : (
          <></>
        )}
        <div>
          {!location.pathname.includes('/login') &&
            !location.pathname.includes('/signup') &&
            !location.pathname.includes('/verifyEmail') && (
              <>
                {user ? (
                  <div>
                    <CSelect<OptionType, false, GroupBase<OptionType>>
                      options={options}
                      onChange={(selected) => {
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
                      }}
                      value={selectedOption}
                      name='user'
                      styles={{
                        control: (base) => ({
                          ...base,
                          'backgroundColor': 'rgb(23, 37, 84)', // Tailwind's blue-950
                          'borderColor': 'white',
                          'borderRadius': '5px',
                          'color': 'white',
                          'textAlign': 'center', // Center the text
                          'padding': '3px', // Add some padding
                          '&:hover': {
                            borderColor: 'white' // Change border color on hover
                          }
                        }),
                        singleValue: (base) => ({
                          ...base,
                          color: 'white', // Text color for the selected value
                          textAlign: 'center' // Center the selected value
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: 'rgb(23, 37, 84)', // Tailwind's blue-950 for dropdown
                          color: 'white'
                        }),
                        option: (base, { isFocused, isSelected }) => ({
                          ...base,
                          backgroundColor: isFocused
                            ? 'rgb(43, 57, 104)'
                            : isSelected
                            ? 'rgb(43, 57, 104)'
                            : 'rgb(23, 37, 84)',
                          color: 'white',
                          textAlign: 'center' // Center the option text
                        })
                      }}
                    />
                  </div>
                ) : (
                  <div className='flex flex-row gap-2 text-nowrap'>
                    <Button
                      text='Log In'
                      color='white'
                      filled={false}
                      onClick={() => {
                        navigate('/login');
                      }}
                    />
                    <Button
                      text='Sign Up'
                      color='white'
                      filled={false}
                      onClick={() => {
                        navigate('signup');
                      }}
                    />
                  </div>
                )}
              </>
            )}
        </div>
      </nav>
      <div className='w-full h-full relative overflow-y-scroll'>
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
