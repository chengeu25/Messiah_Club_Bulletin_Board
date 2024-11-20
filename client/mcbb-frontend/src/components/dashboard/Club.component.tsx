import { CiEdit, CiTrash } from 'react-icons/ci';
import Button from '../formElements/Button.component';
import Card from '../ui/Card';
import { CgDetailsMore } from 'react-icons/cg';
import { LiaTrashRestoreSolid } from 'react-icons/lia';
import { Form } from 'react-router-dom';

interface ClubProps {
  name: string;
  description: string;
  image: string;
  tags: string[];
  editable?: boolean;
  deletable?: boolean;
  inactive?: boolean;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const Club = ({
  name,
  description,
  image,
  tags,
  editable = false,
  deletable = false,
  inactive = false,
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
      <img
        src={image}
        alt={name}
        style={{ objectFit: 'cover' }}
        className='h-[200px] w-[200px] sm:h-[100px] sm:w-[100px] bg-gray-800 rounded-lg'
      />
      <div className='flex flex-col flex-grow'>
        <h1 className='text-xl font-bold text-center xl:text-left'>{name}</h1>
        <p className='text-center xl:text-left'>{description}</p>
        <div className='inline-flex jusify-center xl:justify-start gap-2'>
          {tags?.map((tag, index) => (
            <div key={index} className='text-center bg-blue-200 p-2 rounded-lg'>
              {tag}
            </div>
          ))}
        </div>
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
        {inactive && (
          <Button
            className='w-auto flex-row gap-2 inline-flex items-center'
            text='Reactivate'
            onClick={() => {}}
            icon={<LiaTrashRestoreSolid size={20} />}
            color='blue'
            type='submit'
            name='reactivate'
            filled={false}
          />
        )}
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
