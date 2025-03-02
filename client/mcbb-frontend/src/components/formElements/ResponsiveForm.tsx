import { Form } from 'react-router-dom';

/**
 * Represents the properties for the ResponsiveForm component
 *
 * @interface FormProps
 * @property {React.ReactNode} children - The child elements to be rendered inside the form
 * @property {(event: React.FormEvent<HTMLFormElement>) => Promise<void>} onSubmit - The submit event handler for the form
 * @property {string} encType - The encoding type for the form submission
 */
interface FormProps {
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  encType?:
    | 'application/x-www-form-urlencoded'
    | 'multipart/form-data'
    | 'text/plain'
    | undefined;
}

/**
 * A responsive form wrapper that provides consistent styling and layout across different screen sizes
 *
 * @component
 * @param {FormProps} props - The properties for the ResponsiveForm component
 * @returns {JSX.Element} A centered, scrollable form container with responsive design
 *
 * @example
 * <ResponsiveForm onSubmit={handleSubmit}>
 *   <Input label="Name" name="name" type="text" />
 *   <Input label="Email" name="email" type="email" />
 *   <Button type="submit" text="Submit" />
 * </ResponsiveForm>
 */
const ResponsiveForm = ({
  children,
  onSubmit,
  encType = 'application/x-www-form-urlencoded'
}: FormProps) => (
  <div className='w-full h-full flex justify-center items-center'>
    <div className='flex w-full h-full sm:h-auto sm:w-1/2 sm:min-h-[50%] sm:max-h-[90%] justify-center items-start sm:shadow-md sm:rounded-lg p-5 bg-white overflow-y-auto'>
      <Form
        onSubmit={onSubmit}
        className='flex flex-col gap-2 w-full'
        encType={encType}
      >
        {children}
      </Form>
    </div>
  </div>
);

export default ResponsiveForm;
