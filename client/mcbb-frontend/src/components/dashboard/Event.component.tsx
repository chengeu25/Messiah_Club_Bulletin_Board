import Button from '../formElements/Button.component';

export interface EventProps {
  startTime: Date;
  endTime: Date;
  title: string;
  image: string;
  description: string;
  small?: boolean;
  host: string[];
}

const Event = ({
  startTime,
  endTime,
  title,
  image,
  description,
  small = false,
  host
}: EventProps) => {
  return (
    <div>
      <div className='flex flex-col sm:flex-row justify-between rounded-lg border-blue-900 border-2 p-2'>
        <div className='flex-grow'>
          <h1 className='text-xl font-bold'>{title}</h1>
          <div className='flex flex-col sm:flex-row gap-2'>
            {!small && (
              <img
                src={image}
                alt={title}
                className='h-16 bg-gray-800 rounded-lg'
              />
            )}
            <div>
              <p className='text-nowrap'>
                {startTime.toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit'
                })}{' '}
                -{' '}
                {endTime.toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
              {!small && <p>{description}</p>}
              <p className='font-bold'>Hosted by {host}</p>
            </div>
          </div>
        </div>
        <div className='flex flex-row justify-center items-center gap-2'>
          <Button color='blue' text='View Details' className='text-nowrap' />
          <Button color='blue' text='RSVP' />
        </div>
      </div>
    </div>
  );
};

export default Event;
