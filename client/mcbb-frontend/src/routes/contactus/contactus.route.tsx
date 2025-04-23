import React from 'react';
import { MdEmail } from 'react-icons/md';
import { FaInstagram } from 'react-icons/fa';

const ContactUs: React.FC = () => {
  return (
    <div className='w-full h-full flex justify-center items-center bg-gray-100'>
      <div className='flex w-full h-full sm:w-3/4 sm:h-3/4 justify-center items-center shadow-md rounded-lg p-5 bg-white'>
        <div className='flex flex-col gap-4 w-full h-full'>
          <h1 className='text-3xl font-bold text-center'>Contact Us</h1>
          <p className='text-lg text-center'>
            If you have any questions or need further information, please feel
            free to reach out to us!
          </p>
          <div className='flex flex-col items-center gap-2'>
            <div className='flex items-center gap-2 text-lg'>
              <MdEmail className='text-2xl text-blue-500' />
              <span>
                Email us at: <strong>admin@gosharc.com</strong>
              </span>
            </div>
            <div className='flex items-center gap-2 text-lg'>
              <FaInstagram className='text-2xl text-pink-500' />
              <span>
                Follow us on Instagram: <strong>@go2sharc</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
