/**
 * ForgotPasswordMessage component for displaying password reset instructions.
 *
 * @component ForgotPasswordMessage
 * @description Provides a confirmation page after password reset request
 *
 * @returns {JSX.Element} Rendered message guiding user to check their inbox
 *
 * @workflow
 * 1. Display centered message
 * 2. Inform user about password reset link
 *
 * @features
 * - Clear, concise user guidance
 * - Responsive design
 * - Minimal, focused user experience
 */
const ForgotPasswordMessage = () => (
  <div className='w-full h-full flex justify-center items-center bg-gray-100'>
    {/* Centered message container */}
    <div className='flex w-full h-full sm:w-1/2 sm:h-auto sm:min-h-[50%] justify-center items-start shadow-md rounded-lg p-5 bg-white'>
      <h1 className='text-3xl font-bold'>
        Check your inbox for password reset link
      </h1>
    </div>
  </div>
);

export default ForgotPasswordMessage;
