import { useLoaderData } from 'react-router';
import Input from '../../../../components/formElements/Input.component';
import {
  ClubAdminType,
  ClubDetailType,
  ImageType
} from '../../../../types/databaseTypes';
import Button from '../../../../components/formElements/Button.component';
import ResponsiveForm from '../../../../components/formElements/ResponsiveForm';
import { useEffect, useState } from 'react';
import { CiCirclePlus, CiTrash } from 'react-icons/ci';
import { useSubmit } from 'react-router-dom';

const ClubForm = () => {
  const submit = useSubmit();
  const club = useLoaderData() as ClubDetailType | null;

  const [error, setError] = useState<string[]>([]);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [admins, setAdmins] = useState<ClubAdminType[]>([]);
  const [newAdmin, setNewAdmin] = useState<string>('');
  const [images, setImages] = useState<ImageType[]>([]);
  const [image, setImage] = useState<string>('');
  const [highestImageId, setHighestImageId] = useState<number>(0);
  const [highestAdminId, setHighestAdminId] = useState<number>(0);

  const addAdmin = (newAdmin: string) => {
    setAdmins((prevAdmins) => [
      ...prevAdmins,
      { user: newAdmin, id: highestAdminId + 1 } as ClubAdminType
    ]);
  };

  const updateAdmin = (id: number, newAdmin: string) => {
    setAdmins((prevAdmins) =>
      prevAdmins.map((admin) => {
        if (admin.id === id) {
          return { ...admin, user: newAdmin };
        }
        return admin;
      })
    );
  };

  const removeAdmin = (id: number) => {
    setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== id));
  };

  const addImage = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prevImages) => [
          ...prevImages,
          {
            image: reader.result as string,
            id: highestImageId + 1
          } as ImageType
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (id: number) => {
    setImages((prevImages) => prevImages.filter((image) => image.id !== id));
  };

  const setLogo = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log(reader.result);
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
    if (action === 'create' || action === 'update') {
      const newErrors = [
        name === '' && 'Please enter a name.',
        description === '' && 'Please enter a description.',
        admins.length === 0 && 'Please add at least one officer.',
        image === '' && 'Please add a club logo.',
        images.length === 0 && 'Please add at least one image.'
      ].filter(Boolean) as string[];

      if (newErrors.length > 0) {
        setError(newErrors);
        return;
      }

      formData.append('action', action);
      formData.append('admins', JSON.stringify(admins));
      formData.append('images', JSON.stringify(images));
      submit(formData, { method: 'post' });
    } else if (action === 'add-admin') {
      addAdmin(formData.get('admins-new') as string);
      setNewAdmin('');
    } else if (action.startsWith('remove-admin-')) {
      removeAdmin(parseInt(action.split('-')[2]));
    } else if (action === 'add-image') {
      addImage(formData.get('images-new') as File);
    } else if (action.startsWith('remove-image-')) {
      removeImage(parseInt(action.split('-')[2]));
    } else if (action === 'set-logo') {
      setLogo(formData.get('image') as File);
    } else if (action === 'cancel') {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
    return;
  };

  useEffect(() => {
    if (club) {
      setName(club?.name ?? '');
      setDescription(club?.description ?? '');
      setAdmins(club?.admins ?? []);
      setImages(club?.images ?? []);
      setImage(club?.image ?? '');
    }
  }, [club]);

  useEffect(() => {
    setHighestImageId(
      images.length > 0 ? Math.max(...images.map((image) => image.id)) : 0
    );
    setHighestAdminId(
      admins.length > 0 ? Math.max(...admins.map((admin) => admin.id)) : 0
    );
  }, [images, admins]);

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>{club ? 'Update' : 'Create'} Club</h1>
      {error && (
        <p className='text-red-500'>
          {error.map((e) => (
            <div>{e}</div>
          ))}
        </p>
      )}
      {club && <input type='hidden' name='id' value={club.id} />}
      <Input
        label='Name:'
        name='name'
        type='text'
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setName(e.target.value)
        }
        color='blue'
        filled={false}
        placeholder='Enter the name of the club'
        required
      />
      <Input
        label='Description:'
        name='description'
        type='text'
        value={description}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setDescription(e.target.value)
        }
        color='blue'
        filled={false}
        placeholder='Tell us a little bit about this club...'
        multiline
        required
      />
      <span className='flex flex-row justify-start'>
        Club Officers:<span className='text-red-500'>*</span>
      </span>
      <ul className='flex flex-col gap-2 list-disc'>
        {admins.map((user, idx) => (
          <li key={idx} className='flex-row inline-flex gap-2'>
            <span className='flex-grow'>
              <Input
                value={user.user}
                type='text'
                name={`admin-${user.id}`}
                label=''
                color='blue'
                filled={false}
                placeholder='officeremail@domain.edu'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateAdmin(user.id, e.target.value)
                }
              />
            </span>
            <Button
              text='Remove'
              color='blue'
              filled={false}
              className='inline-flex flex-row items-center justify-center gap-2'
              icon={<CiTrash size={20} />}
              grow={false}
              name={`remove-admin-${user.id}`}
              type='submit'
            />
          </li>
        ))}
        <li className='flex-row inline-flex gap-2'>
          <span className='flex-grow'>
            <Input
              type='text'
              name='admins-new'
              label=''
              color='blue'
              filled={false}
              placeholder='officeremail@domain.edu'
              value={newAdmin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewAdmin(e.target.value)
              }
            />
          </span>
          <Button
            text='Add'
            color='blue'
            filled={false}
            className='inline-flex flex-row items-center justify-center gap-2'
            icon={<CiCirclePlus size={20} />}
            grow={false}
            name='add-admin'
            type='submit'
          />
        </li>
      </ul>
      <div className='flex flex-row gap-2 items-center'>
        <Input required label='Club Logo: ' type='file' name='image' filled />
        <Button
          text='Set Logo'
          color='blue'
          filled={false}
          className='inline-flex flex-row items-center justify-center gap-2 h-12'
          grow={false}
          name='set-logo'
          type='submit'
        />
      </div>
      <img
        src={image}
        style={{ objectFit: 'contain' }}
        alt='Club Logo'
        className='h-20 rounded-lg'
      />
      <span className='flex flex-row justify-start'>
        Club Images:<span className='text-red-500'>*</span>
      </span>
      <ul className='flex flex-col gap-2 list-disc'>
        {images.map((img) => (
          <li key={img.id} className='flex-row inline-flex gap-2 items-center'>
            <span className='flex-grow'>
              <img
                src={img.image}
                style={{ objectFit: 'contain' }}
                alt=''
                className='h-20 bg-gray-800 rounded-lg'
              />
            </span>
            <Button
              text='Remove'
              color='blue'
              filled={false}
              className='inline-flex flex-row items-center justify-center gap-2 h-12'
              icon={<CiTrash size={20} />}
              grow={false}
              name={`remove-image-${img.id}`}
              type='submit'
            />
          </li>
        ))}
        <li className='flex-row inline-flex gap-2'>
          <span className='flex-grow'>
            <Input type='file' name='images-new' label='' />
          </span>
          <Button
            text='Add'
            color='blue'
            filled={false}
            className='inline-flex flex-row items-center justify-center gap-2'
            icon={<CiCirclePlus size={20} />}
            grow={false}
            name='add-image'
            type='submit'
          />
        </li>
      </ul>
      <div className='flex flex-row gap-2'>
        <Button
          text={club ? 'Update' : 'Create'}
          color='blue'
          type='submit'
          name={club ? 'update' : 'create'}
          filled
        />
        <Button
          text='Cancel'
          color='blue'
          filled={false}
          type='submit'
          name='cancel'
        />
      </div>
    </ResponsiveForm>
  );
};

export default ClubForm;
