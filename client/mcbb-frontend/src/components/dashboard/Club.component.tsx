import { CiEdit, CiTrash } from 'react-icons/ci';
import Button from '../formElements/Button.component';
import Card from '../ui/Card';
import { CgDetailsMore } from 'react-icons/cg';
import { Form } from 'react-router-dom';

interface ClubProps {
  name: string;
  description: string;
  image: string;
  editable?: boolean;
  deletable?: boolean;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const Club = ({
  name,
  description,
  image,
  editable = false,
  deletable = false,
  onSubmit = (event) =>
    new Promise(() => {
      console.log(event);
    })
}: ClubProps) => {
  return (
    <Card
      color='slate-200'
      className='flex flex-col xl:flex-row gap-4 border-2 border-blue-900 w-full items-center'
    >
      <img src={image} alt={name} className='h-20 bg-gray-800 rounded-lg' />
      <div className='flex flex-col flex-grow'>
        <h1 className='text-xl font-bold text-center xl:text-left'>{name}</h1>
        <p className='text-center xl:text-left'>{description}</p>
      </div>
      <Form onSubmit={onSubmit} className='flex flex-row gap-2'>
        <Button
          className='w-auto flex-row gap-2 inline-flex items-center'
          text='Details'
          onClick={() => {}}
          icon={<CgDetailsMore size={20} />}
          color='blue'
          type='submit'
          name='details'
        />
        {editable && (
          <>
            <Button
              className='w-auto flex-row gap-2 inline-flex items-center'
              text='Edit'
              onClick={() => {}}
              icon={<CiEdit size={20} />}
              color='blue'
              type='submit'
              name='edit'
              filled={false}
            />
            {deletable && (
              <Button
                className='w-auto flex-row gap-2 inline-flex items-center'
                text='Delete'
                icon={<CiTrash size={20} />}
                onClick={() => {}}
                color='blue'
                type='submit'
                name='delete'
                filled={false}
              />
            )}
          </>
        )}
      </Form>
    </Card>
  );
};

export default Club;
