import { EventType } from '../../types/databaseTypes';
import Button from '../formElements/Button.component';
import Card from '../ui/Card';
import RSVPDropdown from '../specialDropdowns/RSVPDropdown.component';
import { CgDetailsMore } from 'react-icons/cg';
import { useMemo } from 'react';

/**
 * Represents the properties for the Event component
 *
 * @interface EventProps
 * @property {EventType} event - The event details to be displayed
 * @property {boolean} [small=false] - Flag to render the event in a compact view
 * @property {boolean} [showDate=false] - Flag to show date on small view
 * @property {() => void} handleDetailsClick - Callback for viewing event details
 * @property {(type: string) => void} handleRSVPClick - Callback for RSVP actions
 */
export interface EventProps {
  event: EventType;
  small?: boolean;
  showDate?: boolean;
  handleDetailsClick: () => void;
  handleRSVPClick: (type: string) => void;
}

/**
 * Renders an event card with detailed information and interaction buttons
 *
 * @component
 * @param {EventProps} props - The properties for the Event component
 * @returns {JSX.Element} A card displaying event details with details and RSVP buttons
 *
 * @example
 * <Event
 *   event={eventObject}
 *   small={false}
 *   showDate={false}
 *   handleDetailsClick={() => showEventDetails()}
 *   handleRSVPClick={(type) => updateRSVP(type)}
 * />
 */
const Event = ({
  event,
  small = false,
  showDate = false,
  handleDetailsClick,
  handleRSVPClick
}: EventProps) => {
  const { title, startTime, endTime, description, host, image, rsvp, tags } =
    event;

  const [prefix, base64Image] = useMemo(
    () => image?.image?.split(',') ?? ['', ''],
    [image]
  );

  return (
    <div>
      <Card
        color='gray-200'
        className='flex flex-col lg:flex-row gap-4 w-full items-center text-black'
      >
        {!small && (
          <img
            src={
              base64Image !== ''
                ? `data:image/${prefix};base64,${base64Image}`
                : '/logo.png'
            }
            alt={title}
            style={{ objectFit: 'cover' }}
            className='h-[200px] w-[200px] lg:h-[100px] lg:w-[100px] bg-gray-800 rounded-lg'
          />
        )}
        <div className='flex-grow'>
          <h1 className='text-xl font-bold'>{title}</h1>
          <div className='flex flex-col sm:flex-row gap-2'>
            <div>
              {showDate && <p>{startTime.toLocaleDateString()}</p>}
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
              {host && (
                <p className='font-bold'>
                  Hosted by {host.map((host) => host.name).join(', ')}
                </p>
              )}
              {!small && tags?.length > 0 && (
                <div className='inline-flex justify-center xl:justify-start gap-2'>
                  {tags?.map((tag, index) => (
                    <div key={index} className='text-center tag p-2 rounded-lg'>
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
