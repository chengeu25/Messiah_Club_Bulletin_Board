import ResponsiveForm from '../formElements/ResponsiveForm';

/**
 * Renders a full-page loading indicator
 * 
 * @component
 * @returns {JSX.Element} A centered loading message within a responsive form
 * 
 * @example
 * // Used when waiting for data to load or an async operation to complete
 * {isLoading ? <Loading /> : <MainContent />}
 * 
 * @remarks
 * - Utilizes ResponsiveForm for consistent layout
 * - Centered text with large, bold styling
 * - Provides visual feedback during async operations
 * - Minimal, clean design
 */
const Loading = () => {
  return (
    <ResponsiveForm onSubmit={async () => {}}>
      <div className='w-full h-full flex justify-center items-center'>
        <h1 className='text-3xl font-bold text-center'>Loading...</h1>
      </div>
    </ResponsiveForm>
  );
};

export default Loading;
