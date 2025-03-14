import React from 'react';
import us from '../../../assets/us.jpeg';

const AboutUs: React.FC = () => {
  return (
    <div className='w-full h-full flex justify-center items-center bg-gray-100 p-4 overflow-auto'>
      <div className='flex flex-col sm:flex-row w-full max-w-4xl bg-white shadow-md rounded-lg'>
        <div className='flex-shrink-0 w-full sm:w-1/2'>
          <img
            src={us}
            alt='The SHARC Team'
            className='w-full h-auto object-contain rounded-lg'
          />
        </div>
        <div className='flex-grow p-4'>
          <h1 className='text-3xl font-bold mb-4'>About Us</h1>
          <p className='text-lg mb-4'>
            Welcome to SHARC! We are a team of dedicated individuals working to
            connect students with clubs and events on campus.
          </p>
          <p className='text-lg'>
            SHARC is created by Caleb Rice, Matthew Merlo, Garret Van Dyke, and
            Cheng Eu Sun. If you see us around campus make sure to say Hello!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
