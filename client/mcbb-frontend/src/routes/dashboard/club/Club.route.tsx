import React, { useEffect, useMemo } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/formElements/Button.component';
import Officer from '../../../components/clubDetails/Officer';
import Event from '../../../components/dashboard/Event.component';
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
  useActionData
} from 'react-router';
import {
  ClubAdminType,
  ClubDetailType,
  EventType,
  ImageType,
  UserType
} from '../../../types/databaseTypes';
import { OptionType } from '../../../components/formElements/Select.styles';
import { Form, useSubmit } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';

const Club = () => {
  const submit = useSubmit();
  const { imageId } = useParams();
  const navigate = useNavigate();
  const successMessage = new URLSearchParams(window.location.search).get(
    'success'
  );
  const { user, club, events } = useLoaderData() as {
    user: UserType;
    club: ClubDetailType;
    events: EventType[];
  };
  const actionData = useActionData() as {
    error: string;
  };
  const { addNotification } = useNotification();

  const isSubscribed = useMemo(() => club?.isSubscribed ?? false, [club]);
  const isBlocked = useMemo(() => club?.isBlocked ?? false, [club]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
    formData.append('clubId', club.id.toString());
    formData.append('action', action);
    formData.append('userId', user.email);

    submit(formData, { method: 'post' });
  };

  useEffect(() => {
    if (actionData?.error) {
      addNotification(actionData.error, 'error');
    }
  }, [actionData]);

  return (
    <div className='flex flex-col p-4 sm:px-[5%] lg:px-[10%] items-center w-full h-full overflow-y-auto gap-4'>
      {/* Display success message if it exists */}
      {successMessage && (
        <div className='bg-green-200 text-green-800 p-4 rounded mb-4'>
          <strong>Success:</strong> {successMessage}
        </div>
      )}
      <Card
        color='gray-300'
        padding={4}
        className='w-full flex gap-2 relative flex-row justify-between items-center'
      >
        <h1 className='font-bold text-4xl flex-grow'>{club?.name}</h1>
        <Form
          onSubmit={handleSubmit}
          className='flex-shrink-0 flex gap-2 text-nowrap flex-col sm:flex-row'
        >
          {user?.clubAdmins?.includes(club?.id) && (
            <Button
              type='submit'
              text='New Event'
              filled={true}
              name='newEvent'
            />
          )}
          {(user?.clubAdmins?.includes(club?.id) || user.isFaculty) && (
            <>
              <Button
                type='submit'
                text='Reports'
                filled={true}
                name='getReport'
              />
              <Button
                onClick={() => navigate(`/club/${club.id}/sendEmail`)}
                text='Send Email'
                filled={true}
              />
            </>
          )}
          <Button
            type='submit'
            text={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            name={isSubscribed ? 'unsubscribe' : 'subscribe'}
            filled={true}
          />
          <Button
            type='submit'
            text={isBlocked ? 'Allow Suggestions' : "Don't Suggest"}
            name={isBlocked ? 'unblock' : 'block'}
            filled={true}
          />
        </Form>
      </Card>
      <Card color='gray-300' padding={4} className='w-full flex-col gap-2'>
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
              tabIndex={0}
              onClick={() =>
                navigate(`/dashboard/club/${club.id}/images/${image.id}`)
              }
            />
          ))}
        </div>
      )}
      {(club?.tags?.length ?? 0) > 0 && (
        <div className='inline-flex flex-row w-full gap-2 items-center flex-wrap'>
          {club?.tags?.map((tag: OptionType, index: number) => (
            <Card
              key={index}
              color='gray-300'
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
          color='gray-300'
          padding={4}
          className='w-full h-full flex-col gap-2'
        >
          <h1 className='text-xl font-bold'>Club Officers</h1>
          <div className='overflow-y-auto h-full flex gap-2 flex-col'>
            {club.admins.map((officer: ClubAdminType, index: number) => (
              <Officer key={index} {...officer} />
            ))}
          </div>
        </Card>
        <Card
          color='gray-300'
          padding={4}
          className='w-full h-full flex-col gap-2'
        >
          <h1 className='text-xl font-bold'>Upcoming Events</h1>
          <div className='overflow-y-auto h-full flex gap-2 flex-col'>
            {events.map((event: EventType, index: number) => (
              <Event
                key={index}
                event={{
                  ...event,
                  startTime: new Date(event.startTime),
                  endTime: new Date(event.endTime)
                }}
                small={true}
                showDate={true}
                handleDetailsClick={() =>
                  submit(
                    { id: event.id, action: 'details' },
                    { method: 'post' }
                  )
                }
                handleRSVPClick={(type) =>
                  submit(
                    { id: event.id, type: type, action: 'rsvp' },
                    { method: 'post' }
                  )
                }
              />
            ))}
          </div>
        </Card>
      </div>
      {imageId !== null && imageId !== '' && imageId !== undefined && (
        <div className='w-full h-full absolute top-0 left-0 bg-black/50'>
          <Outlet />
        </div>
      )}
    </div>
  );
};

export default Club;
