import { useNavigate, Link } from 'react-router-dom';

import home1 from '../../../assets/home1.jpg';
import home2 from '../../../assets/home2.jpg';
import home3 from '../../../assets/home3.jpg';
import home4 from '../../../assets/home4.jpg';

import Button from '../../components/formElements/Button.component';
import Card from '../../components/ui/Card';
import { useSchool } from '../../contexts/SchoolContext';
import { MdOutlineEvent } from 'react-icons/md';
import { IoMdNotifications, IoMdShare } from 'react-icons/io';
import { CgMenuGridO } from 'react-icons/cg';

/**
 * LandingPage component for introducing SHARC and its features.
 *
 * @component LandingPage
 * @description Provides an engaging landing page that showcases the application's core features
 *
 * @returns {JSX.Element} Rendered landing page with introduction, features, and footer
 *
 * @workflow
 * 1. Display main headline and subtext
 * 2. Render sign-up button
 * 3. Showcase application features through image and text cards
 * 4. Display footer with creator information and links
 *
 * @features
 * - Responsive design
 * - Visually appealing card layout
 * - Clear value proposition
 * - Easy sign-up access
 * - Creator and related links
 */
const LandingPage = () => {
  // Navigation hook for programmatic routing
  const navigate = useNavigate();
  const { currentSchool } = useSchool();

  return (
    <div className='bg-blue-900 relative overflow-y-auto w-full h-full'>
      <div className='flex flex-col gap-4 w-full p-4 sm:px-[15%]'>
        {/* Hero section with headline and call-to-action */}
        <div className={`relative flex flex-col gap-5 p-4 bg-blue-900`}>
          <h1 className='text-3xl sm:text-4xl lg:text-5xl text-white'>
            Welcome to <strong>SHARC</strong>, the place to find out about{' '}
            <strong>student happenings</strong> and get{' '}
            <strong>recommendations for clubs</strong> to get involved in.
          </h1>
          <p className='font-italic text-gray-300 text-xl'>
            You've come to the perfect place to get connected with clubs,
            organizations, and events on campus that pique your interest.
          </p>

          {/* Sign-up button */}
          <Button
            text='Sign Up'
            className='p-4'
            onClick={() => {
              if (currentSchool) {
                navigate(`/signup/${currentSchool.id}`);
              } else {
                navigate('/selectSchool?route=signup');
              }
            }}
            filled={true}
          />

          {/* New "Add School" button */}
          <Button
            text='Add School'
            className='p-4 mt-4'
            onClick={() => navigate('/addSchool')}
            filled={true}
          />
        </div>

        {/* Features grid with image and text cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Feature cards showcasing application capabilities */}
          <Card color='blue-700' padding={0}>
            <img
              src={home1}
              className='w-full h-full object-cover rounded-lg'
              alt='SHARC Feature 1'
            />
          </Card>
          <Card
            color='blue-700'
            padding={6}
            className='text-3xl sm:text-4xl lg:text-5xl text-white font-bold items-center justify-center'
          >
            <div className='flex items-center flex-col text-center'>
              <MdOutlineEvent size={80} />
              <p>See what events clubs are hosting, based on your interests.</p>
            </div>
          </Card>
          <Card
            color='blue-700'
            padding={6}
            className='text-3xl sm:text-4xl lg:text-5xl text-white font-bold items-center justify-center'
          >
            <div className='flex items-center flex-col text-center'>
              <IoMdNotifications size={80} />
              <p>Get notified if one of your clubs is hosting an event.</p>
            </div>
          </Card>
          <Card color='blue-700' padding={0}>
            <img
              src={home2}
              className='w-full h-full object-cover rounded-lg'
              alt='SHARC Feature 2'
            />
          </Card>
          <Card color='blue-300' padding={0}>
            <img
              src={home3}
              className='w-full h-full object-cover rounded-lg'
              alt='SHARC Feature 3'
            />
          </Card>
          <Card
            color='blue-700'
            padding={6}
            className='text-3xl sm:text-4xl lg:text-5xl text-white font-bold items-center justify-center'
          >
            <div className='flex items-center flex-col text-center'>
              <CgMenuGridO size={80} />
              <p>Explore the many opportunities to get involved on campus.</p>
            </div>
          </Card>
          <Card
            color='blue-700'
            padding={6}
            className='text-3xl sm:text-4xl lg:text-5xl text-white font-bold items-center justify-center'
          >
            <div className='flex items-center flex-col text-center'>
              <IoMdShare size={80} />
              <p>
                Discuss events and clubs with other potential attendees and club
                leaders.
              </p>
            </div>
          </Card>
          <Card color='blue-700' padding={0}>
            <img
              src={home4}
              className='w-full h-full object-cover rounded-lg'
              alt='SHARC Feature 4'
            />
          </Card>
        </div>
        <div className='text-lg text-white font-bold'>
          Photos by Messiah Pulse.
        </div>
      </div>

      {/* Footer with creator information and external links */}
      <footer className='w-full bg-blue-950 text-white p-3 flex flex-col gap-2'>
        SHARC is created by Caleb Rice, Matthew Merlo, Garret Van Dyke, and
        Cheng Eu Sun.
        <hr className='w-full border-white border-1' />
        <div className='flex flex-col md:flex-row gap-2 w-full'>
          <ul className='flex flex-col gap-2 w-full'>
            <li>
              {' '}
              <Link to='/aboutus'> About Us </Link>{' '}
            </li>
            <li>
              <Link to='/contactus'> Contact Us </Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

