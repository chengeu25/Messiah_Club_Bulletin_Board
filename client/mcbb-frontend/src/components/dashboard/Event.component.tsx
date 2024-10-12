import Button from '../formElements/Button.component';

export interface EventProps {
  startTime: Date;
  endTime: Date;
  title: string;
  image: string;
  description: string;
}

const Event = ({
  startTime,
  endTime,
  title,
  image,
  description
}: EventProps) => {
  return (
    <div>
      <div className='flex flex-row justify-between'>
        <div className='flex-grow'>
          <h1 className='text-xl font-bold'>{title}</h1>
          <div className='flex gap-2'>
            <img
              src={image}
              alt={title}
              className='h-16 bg-gray-800 rounded-lg'
            />
            <div>
              <p>
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
              <p>{description}</p>
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
