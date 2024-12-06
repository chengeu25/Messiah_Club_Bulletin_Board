import React, { useState, useEffect } from 'react';
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

  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch subscription status when the component mounts
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/check_subscription?user_id=${user.email}&club_id=${club?.id}`,
          {
            method: 'POST',
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsSubscribed(data.isSubscribed);
        } else {
          console.error('Failed to fetch subscription status');
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      }
    };

    if (user?.email && club?.id) checkSubscription();
  }, [user?.email, club?.id]);

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
    </div>
  );
};

export default Club;
