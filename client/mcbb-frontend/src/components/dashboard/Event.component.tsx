import { EventType } from '../../types/databaseTypes';
import Button from '../formElements/Button.component';

export interface EventProps {
  event: EventType;
  small?: boolean;
  handleDetailsClick: () => void;
  handleRSVPClick: () => void;
}

const Event = ({
  event,
  small = false,
  handleDetailsClick,
  handleRSVPClick
}: EventProps) => {
  const { title, startTime, endTime, description, host, image } = event;
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
              <p className='font-bold'>Hosted by {host.join(', ')}</p>
            </div>
          </div>
        </div>
        <div className='flex flex-row justify-center items-center gap-2'>
          <Button
            color='blue'
            text='View Details'
            className='text-nowrap'
            onClick={handleDetailsClick}
          />
          <Button color='blue' text='RSVP' onClick={handleRSVPClick} />
        </div>
      </div>
    </div>
  );
};

export default Event;
