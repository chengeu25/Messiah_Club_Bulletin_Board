import { Link, useNavigate } from 'react-router-dom';

import home1 from '../../../assets/home1.png';
import home2 from '../../../assets/home2.png';
import home3 from '../../../assets/home3.png';
import home4 from '../../../assets/home4.jpg';

import Button from '../../components/formElements/Button.component';
import Card from '../../components/ui/Card';
import styles from './landingPage.module.css';

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

  return (
    <div className='bg-blue-900'>
      <div className='flex flex-col gap-4 w-full p-4 sm:px-[15%]'>
        {/* Hero section with headline and call-to-action */}
        <div
          className={`relative flex flex-col gap-5 ${styles.bgStaggered} p-4 bg-blue-900`}
        >
          <h1 className='text-3xl sm:text-4xl lg:text-6xl text-white'>
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
              navigate('/signup');
            }}
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
            className='text-5xl text-white font-bold items-center justify-center'
          >
            See what events clubs are hosting, based on your interests.
          </Card>
          <Card
            color='blue-700'
            padding={6}
            className='text-5xl text-white font-bold items-center justify-center'
          >
            Get notified if one of your clubs is hosting an event.
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
            className='text-5xl text-white font-bold items-center justify-center'
          >
            Explore the many opportunities to get involved on campus.
          </Card>
          <Card
            color='blue-700'
            padding={6}
            className='text-5xl text-white font-bold items-center justify-center'
          >
            Discuss events and clubs with other potential attendees and club
            leaders.
          </Card>
          <Card color='blue-700' padding={0}>
            <img
              src={home4}
              className='w-full h-full object-cover rounded-lg'
              alt='SHARC Feature 4'
            />
          </Card>
        </div>
      </div>

      {/* Footer with creator information and external links */}
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
