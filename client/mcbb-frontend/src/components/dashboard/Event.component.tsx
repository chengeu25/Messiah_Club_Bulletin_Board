import { EventType } from '../../types/databaseTypes';
import Button from '../formElements/Button.component';
import Card from '../ui/Card';
import RSVPDropdown from '../specialDropdowns/RSVPDropdown.component';
import { CgDetailsMore } from 'react-icons/cg';

export interface EventProps {
  event: EventType;
  small?: boolean;
  handleDetailsClick: () => void;
  handleRSVPClick: (type: string) => void;
}

const Event = ({
  event,
  small = false,
  handleDetailsClick,
  handleRSVPClick
}: EventProps) => {
  const { title, startTime, endTime, description, host, image, rsvp, tags } =
    event;

  return (
    <div>
      <Card
        color='slate-200'
        className='flex flex-col lg:flex-row gap-4 border-2 border-blue-900 w-full items-center'
      >
        {!small && (
          <img
            src={image}
            alt={title}
            style={{ objectFit: 'cover' }}
            className='h-[200px] w-[200px] lg:h-[100px] lg:w-[100px] bg-gray-800 rounded-lg'
          />
        )}
        <div className='flex-grow'>
          <h1 className='text-xl font-bold'>{title}</h1>
          <div className='flex flex-col sm:flex-row gap-2'>
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
              {host && <p className='font-bold'>Hosted by {host.join(', ')}</p>}
              {!small && tags?.length > 0 && (
                <div className='inline-flex justify-center xl:justify-start gap-2'>
                  {tags?.map((tag, index) => (
                    <div
                      key={index}
                      className='text-center bg-blue-200 p-2 rounded-lg'
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className={`flex ${
            small ? 'flex-col' : 'flex-row'
          } justify-center items-center gap-2 relative`}
        >
          <Button
            color='blue'
            text='Details'
            icon={<CgDetailsMore size={20} />}
            className='w-50 text-nowrap flex flex-row items-center gap-2'
            onClick={handleDetailsClick}
          />
          <RSVPDropdown handleRSVPClick={handleRSVPClick} initialValue={rsvp} />
        </div>
      </Card>
    </div>
  );
};

export default Event;
