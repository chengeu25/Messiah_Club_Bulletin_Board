import React from 'react';

const ContactUs: React.FC = () => {
  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-100">
      <div className="flex w-full h-full sm:w-3/4 sm:h-3/4 justify-center items-center shadow-md rounded-lg p-5 bg-white">
        <div className="flex flex-col gap-2 w-full h-full">
          <h1 className="text-3xl font-bold">Contact Us</h1>
          <p className="text-lg">
            If you have any questions or need further information, please feel free to reach out to us!
          </p>
          <p className="text-lg">
            You can contact us at: <strong>sharc@sharc.com</strong>
          </p>
          <p className="text-lg">
            Or call us at: <strong>(717) sharc</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
