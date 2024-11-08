import { Link, useNavigate } from 'react-router-dom';

import home1 from '../../../assets/home1.png';
import home2 from '../../../assets/home2.png';
import home3 from '../../../assets/home3.png';
import home4 from '../../../assets/home4.png';

import Button from '../../components/formElements/Button.component';
import Card from '../../components/ui/Card';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className='bg-gray-100'>
      <div className='flex flex-col gap-4 w-full p-4 sm:px-[15%] '>
        <Card color='slate-300' padding={6}>
          <div className='flex flex-col gap-5'>
            <h1 className='text-3xl sm:text-4xl lg:text-6xl font-bold'>
              Welcome to <strong>SHARC</strong>, the place to find out about{' '}
              <strong>student happenings</strong> and get{' '}
              <strong>recommendations for clubs</strong> to get involved in.
            </h1>

            <p className='font-italic text-gray-500 text-xl'>
              You've come to the perfect place to get connected with clubs,
              organizations, and events on campus that pique your interest.
            </p>

            <Button
              color='blue'
              text='Log In or Sign Up'
              onClick={() => {
                navigate('/login');
              }}
              filled={true}
            />
          </div>
        </Card>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card color='slate-300' padding={0}>
            <img src={home1} className='w-full h-full object-cover' />
          </Card>
          <Card
            color='slate-300'
            padding={6}
            className='text-5xl font-bold items-center justify-center'
          >
            See what events clubs are hosting, based on your interests.
          </Card>
          <Card
            color='slate-300'
            padding={6}
            className='text-5xl font-bold items-center justify-center'
          >
            Get notified if one of your clubs is hosting an event.
          </Card>
          <Card color='slate-300' padding={0}>
            <img src={home2} className='w-full h-full object-cover' />
          </Card>
          <Card color='slate-300' padding={0}>
            <img src={home3} className='w-full h-full object-cover' />
          </Card>
          <Card
            color='slate-300'
            padding={6}
            className='text-5xl font-bold items-center justify-center'
          >
            Explore the many opportunities to get involved on campus.
          </Card>
          <Card
            color='slate-300'
            padding={6}
            className='text-5xl font-bold items-center justify-center'
          >
            Discuss events and clubs with other potential attendees and club
            leaders.
          </Card>
          <Card color='slate-300' padding={0}>
            <img src={home4} className='w-full h-full object-cover' />
          </Card>
        </div>
      </div>
      <footer className='w-full bg-blue-950 text-white p-3 flex flex-col gap-2'>
        SHARC is created by Caleb Rice, Matthew Merlo, Garret Van Dyke, and
        Cheng Eu Sun.
        <hr className='w-full border-white border-1' />
        <div className='flex flex-col md:flex-row gap-2 w-full'>
          <ul className='flex flex-col gap-2 w-full'>
            <li>About Us</li>
            <li>Contact Us</li>
          </ul>
          <ul className='flex flex-col gap-2 w-full'>
            <li>
              <Link
                to='https://messiah.edu'
                target='_blank'
                rel='noopener noreferrer'
              >
                Messiah University
              </Link>
            </li>
            <li>
              <Link
                to='https://falconlink.webapps.messiah.edu'
                target='_blank'
                rel='noopener noreferrer'
              >
                FalconLink
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
