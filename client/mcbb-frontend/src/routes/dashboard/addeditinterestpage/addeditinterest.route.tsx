import React, { useState, useEffect } from 'react';
import { useSubmit } from 'react-router-dom';
import Input from '../../../components/formElements/Input.component';
import Button from '../../../components/formElements/Button.component';
import 'react-datepicker/dist/react-datepicker.css';
import ResponsiveForm from '../../../components/formElements/ResponsiveForm';

const AddedInterest = () => {
  const [interestName, setInterestName] = useState('');
  const [error, setError] = useState<string[]>([]);
  const submit = useSubmit();

  // You can fetch existing interest data here if needed
  useEffect(() => {
    // Simulate fetching existing interest (could be a prop or API call)
    const fetchedInterest = 'Technology'; // Example interest to prefill
    setInterestName(fetchedInterest);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const errors: string[] = [];

    if (!interestName.trim()) {
      errors.push('Interest name is required.');
    }

    if (errors.length > 0) {
      setError(errors);
      return;
    }

    // You can submit the form data to an API or handle accordingly
    submit({ interestName }, { method: 'post' });
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold text-center">Edit Interest</h1>
      {error.length > 0 && (
        <div className="text-red-500">
          {error.map((err, idx) => (
            <div key={idx}>{err}</div>
          ))}
        </div>
      )}
      <Input
        label="Interest Name:"
        name="interestName"
        type="text"
        value={interestName}
        onChange={(e) => setInterestName((e.target as HTMLInputElement).value)}
        placeholder="Enter the interest name"
        color="blue"
        filled={false}
        required
      />
      <div className="flex flex-row gap-2 mt-4">
        <Button text="Submit" color="blue" type="submit" filled name="submit" />
        <Button text="Cancel" color="blue" filled={false} type="reset" name="cancel" />
      </div>
    </ResponsiveForm>
  );
};

export default AddedInterest;
