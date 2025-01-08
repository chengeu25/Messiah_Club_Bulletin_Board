import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-100">
      <div className="flex w-full h-full sm:w-3/4 sm:h-3/4 justify-center items-center shadow-md rounded-lg p-5 bg-white">
        <div className="flex flex-col gap-2 w-full h-full">
          <h1 className="text-3xl font-bold">About Us</h1>
          <p className="text-lg">
            Welcome to SHARC! We are a team of dedicated individuals working to connect students with clubs and events on campus.
          </p>
          <p className="text-lg">
            SHARC is created by Caleb Rice, Matthew Merlo, Garret Van Dyke, and Cheng Eu Sun. If you see us around campus make sure to say Hello!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
