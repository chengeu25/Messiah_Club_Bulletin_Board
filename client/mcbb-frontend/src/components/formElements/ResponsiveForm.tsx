import { Form } from 'react-router-dom';

interface FormProps {
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const ResponsiveForm = ({ children, onSubmit }: FormProps) => (
  <div className='w-full h-full flex justify-center items-center'>
    <div className='flex w-full h-full sm:h-auto sm:w-1/2 sm:min-h-[50%] sm:max-h-[90%] justify-center items-start shadow-md rounded-lg p-5 bg-white overflow-y-scroll'>
      <Form onSubmit={onSubmit} className='flex flex-col gap-2 w-full'>
        {children}
      </Form>
    </div>
  </div>
);

export default ResponsiveForm;
