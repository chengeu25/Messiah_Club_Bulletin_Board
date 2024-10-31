import Card from '../../../components/ui/Card';
import Button from '../../../components/formElements/Button.component';
import Event from '../../../components/dashboard/Event.component';
import Officer from '../../../components/clubDetails/Officer';

const demoOfficers = [
  {
    name: 'Officer 1',
    image: '../../../../assets/logo.png',
    email: '5mZCz@example.com'
  },
  {
    name: 'Officer 2',
    image: '../../../../assets/logo.png',
    email: '5zGaE@example.com'
  }
];

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
  return (
    <div className='flex flex-col p-4 sm:px-[5%] lg:px-[10%] items-center w-full h-full overflow-y-scroll gap-4'>
      <Card
        color='slate-300'
        padding={4}
        className='w-full flex gap-2 relative flex-row justify-between items-center'
      >
        <h1 className='font-bold text-4xl flex-grow'>Club Name</h1>
        <div className='flex-shrink-0 flex'>
          <Button color='blue' text='Subscribe' filled={true} />
        </div>
      </Card>
      <Card color='slate-300' padding={4} className='w-full flex-col gap-2'>
        <p>
          Club Description Lorem ipsum dolor sit amet, consectetur adipiscing
          elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
          laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
          in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </Card>
      <div className='flex flex-row w-full gap-4 overflow-x-scroll min-h-48'>
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
      <div className='flex flex-col gap-4 lg:flex-row w-full h-1/2'>
        <Card
          color='slate-300'
          padding={4}
          className='w-full h-full flex-col gap-2'
        >
          <h1 className='text-xl font-bold'>Club Officers</h1>
          <div className='overflow-y-scroll h-full flex gap-2 flex-col'>
            {demoOfficers.map((officer) => (
              <Officer {...officer} />
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
            {demoEvents.map((event) => (
              <Event {...event} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Club;
