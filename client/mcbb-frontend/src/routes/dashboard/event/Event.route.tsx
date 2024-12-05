import Card from '../../../components/ui/Card';
import { IoMdTime } from 'react-icons/io';
import { IoLocationOutline } from 'react-icons/io5';
import { RiAccountCircleLine } from 'react-icons/ri';
import { FaDollarSign } from 'react-icons/fa6';
import { Link, useLoaderData } from 'react-router-dom';
import Button from '../../../components/formElements/Button.component';
import Input from '../../../components/formElements/Input.component';
import Comment from '../../../components/forums/Comment.component';
import { EventDetailType } from '../../../types/databaseTypes';
import { format } from 'date-fns';

const Event = () => {
  const { event } = useLoaderData() as { event: EventDetailType };
  return (
    <div className='flex flex-col p-4 sm:px-[5%] lg:px-[10%] items-center w-full h-full overflow-y-scroll gap-2'>
      <Card
        color='slate-300'
        padding={4}
        className='w-full flex gap-2 relative flex-row justify-between items-center'
      >
        <h1 className='font-bold text-4xl flex-grow'>{event?.title}</h1>
        <div className='flex-shrink-0 flex'>
          <Button color='blue' text='RSVP' filled={true} />
        </div>
      </Card>
      <div className='flex flex-col w-full gap-4 m-2'>
        <Card color='slate-300' padding={4} className='flex-col gap-2'>
          <p className='flex flex-row gap-2 items-center text-nowrap'>
            <IoMdTime size={24} /> <strong>Time:</strong>{' '}
            {format(new Date(event?.startTime), 'MM/dd/yyyy HH:mm')} -{' '}
            {format(new Date(event?.endTime), 'MM/dd/yyyy HH:mm')}
          </p>
          <p className='flex flex-row gap-2 items-center'>
            <IoLocationOutline size={24} /> <strong>Location:</strong>{' '}
            {event?.location}
          </p>
          <p className='flex flex-row gap-2 items-center'>
            <RiAccountCircleLine size={24} /> <strong>Organizer(s):</strong>{' '}
            {event?.host.map((h) => (
              <Link
                to={`/dashboard/club/${h.id}`}
                key={h.id}
                className={'underline text-blue-600'}
              >
                {h.name}
              </Link>
            ))}
          </p>
          <p className='flex flex-row gap-2 items-center'>
            <FaDollarSign size={24} /> <strong>Cost:</strong>{' '}
            {event?.cost ?? 'FREE'}
          </p>
        </Card>
      </div>
      <Card color='slate-300' padding={4} className='w-full flex-col gap-2'>
        <p>{event?.description}</p>
      </Card>
      <div className='flex flex-row w-full gap-4 overflow-x-scroll min-h-48 mt-2'>
        <img
          src='../../../../assets/logo.png'
          alt='Event'
          className='h-48 bg-gray-800 rounded-lg shadow-md'
        />
        <img
          src='../../../../assets/logo.png'
          alt='Event'
          className='h-48 bg-gray-800 rounded-lg shadow-md'
        />
        <img
          src='../../../../assets/logo.png'
          alt='Event'
          className='h-48 bg-gray-800 rounded-lg shadow-md'
        />
      </div>
      <hr className='border-2 border-black w-full mt-2' />
      <h1 className='text-3xl font-bold text-left w-full'>Discuss</h1>
      <div className='flex flex-row w-full gap-2 items-center'>
        <Input
          label='Add a Comment: '
          placeholder='Comment'
          name='comment'
          type='text'
          color='blue'
          filled={false}
          labelOnSameLine
        />
        <div className='flex-shrink-0'>
          <Button
            color='blue'
            text='Comment'
            filled={true}
            className='w-auto'
          />
        </div>
      </div>
      <div className='w-full flex flex-col align-left gap-2'>
        <Comment
          creator='User'
          content='Comment Lorem ipsum dolor sit amet, consectetur adipiscing
          elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
          laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
          in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.'
          lastModified={new Date()}
        />
        <Comment
          creator='User'
          content='Comment Lorem ipsum dolor sit amet, consectetur adipiscing
          elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
          laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
          in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.'
          lastModified={new Date()}
          indentLevel={1}
        />
        <Comment
          creator='User'
          content='Comment Lorem ipsum dolor sit amet, consectetur adipiscing
          elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
          laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
          in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.'
          lastModified={new Date()}
        />
      </div>
    </div>
  );
};

export default Event;
