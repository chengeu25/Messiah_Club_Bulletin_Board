import ResponsiveForm from '../formElements/ResponsiveForm';

/**
 * Loading indicator
 * @returns A loading component
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
