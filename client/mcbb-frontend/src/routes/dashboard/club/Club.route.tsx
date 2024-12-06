import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/formElements/Button.component';
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

const Club = () => {
  const submit = useSubmit();
  const { user, club } = useLoaderData() as {
    user: UserType;
    club: ClubDetailType;
  };

  // Check if the user is already subscribed
  const [isSubscribed, setIsSubscribed] = useState(
    club?.subscribers?.some(
      (subscriber: { userId: any; isActive: any; }) => subscriber.userId === user.email && subscriber.isActive
    )
  );

  console.log('User:', user.email);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
    formData.append('clubId', club.id.toString());
    formData.append('action', action);
    formData.append('userId', user.email);

    // Update UI state based on the action
    if (action === 'subscribe') {
      setIsSubscribed(true);
    } else if (action === 'unsubscribe') {
      setIsSubscribed(false);
    }

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
            text={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            name={isSubscribed ? 'unsubscribe' : 'subscribe'}
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
          <div className='overflow-y-scroll h-full flex gap-2 flex-col'></div>
        </Card>
      </div>
    </div>
  );
};

export default Club;
