import Card from '../../../components/ui/Card';
import Button from '../../../components/formElements/Button.component';
import Event from '../../../components/dashboard/Event.component';
import Officer from '../../../components/clubDetails/Officer';
import { useLoaderData } from 'react-router';
import {
  ClubAdminType,
  ClubDetailType,
  ImageType,
  UserType
} from '../../../types/databaseTypes';
import { OptionType } from '../../../components/formElements/Select.styles';
import { Form, useSubmit } from 'react-router-dom';

const demoEvents = [
  {
    startTime: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      14,
      0,
      0
    ),
    endTime: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      15,
      0,
      0
    ),
    title: 'Event 1',
    image: '../../../../assets/logo.png',
    description: 'This is an event where all this stuff happens...',
    host: 'Club 1'
  },
  {
    startTime: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      12,
      0,
      0
    ),
    endTime: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      13,
      0,
      0
    ),
    title: 'Event 2',
    image: './../../../assets/logo.png',
    description: 'This is an event where all this stuff happens...',
    host: 'Club 1'
  },
  {
    startTime: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      12,
      0,
      0
    ),
    endTime: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      13,
      0,
      0
    ),
    title: 'Event 3',
    image: './../../../assets/logo.png',
    description: 'This is an event where all this stuff happens...',
    host: 'Club 1'
  }
];

const Club = () => {
  const submit = useSubmit();
  const { user, club } = useLoaderData() as {
    user: UserType;
    club: ClubDetailType;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
    console.log(action);
    formData.append('clubId', club.id.toString());
    formData.append('action', action);
    submit(formData, { method: 'post' });
  };

  return (
    <div className='flex flex-col p-4 sm:px-[5%] lg:px-[10%] items-center w-full h-full overflow-y-scroll gap-4'>
      <Card
        color='slate-300'
        padding={4}
        className='w-full flex gap-2 relative flex-row justify-between items-center'
      >
        <h1 className='font-bold text-4xl flex-grow'>{club?.name}</h1>
        <Form
          onSubmit={handleSubmit}
          className='flex-shrink-0 flex gap-2 text-nowrap flex-col sm:flex-row'
        >
          {user?.clubAdmins.includes(club?.id) && (
            <Button
              type='submit'
              color='blue'
              text='New Event'
              filled={true}
              name='newEvent'
            />
          )}
          <Button
            type='submit'
            color='blue'
            text='Subscribe'
            name='subscribe'
            filled={true}
          />
        </Form>
      </Card>
      <Card color='slate-300' padding={4} className='w-full flex-col gap-2'>
        <p>{club?.description}</p>
      </Card>
      {(club?.images?.length ?? 0) > 0 && (
        <div className='flex flex-row w-full gap-4 overflow-x-auto h-48'>
          {club?.images.map((image: ImageType, index: number) => (
            <img
              key={index}
              src={image.image}
              alt='Club Image'
              className='h-full object-contain rounded-lg'
            />
          ))}
        </div>
      )}
      {(club?.tags?.length ?? 0) > 0 && (
        <div className='inline-flex flex-row w-full gap-2 items-center flex-wrap'>
          {club?.tags?.map((tag: OptionType, index: number) => (
            <Card
              key={index}
              color='slate-300'
              padding={4}
              className='w-min text-nowrap'
            >
              {tag.label}
            </Card>
          ))}
        </div>
      )}
      <div className='flex flex-col gap-4 lg:flex-row w-full h-1/2'>
        <Card
          color='slate-300'
          padding={4}
          className='w-full h-full flex-col gap-2'
        >
          <h1 className='text-xl font-bold'>Club Officers</h1>
          <div className='overflow-y-scroll h-full flex gap-2 flex-col'>
            {club.admins.map((officer: ClubAdminType, index: number) => (
              <Officer key={index} {...officer} />
            ))}
          </div>
        </Card>
        <Card
          color='slate-300'
          padding={4}
          className='w-full h-full flex-col gap-2'
        >
          <h1 className='text-xl font-bold'>Upcoming Events</h1>
          <div className='overflow-y-scroll h-full flex gap-2 flex-col'>
            {demoEvents.map((event, index) => (
              <Event key={index} {...event} small />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Club;
