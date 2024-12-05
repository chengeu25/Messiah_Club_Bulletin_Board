import React, { useEffect, useState } from 'react';
import { Form, useSubmit, useSearchParams } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';

const data = [
    { name: "Anom", age: 19, gender: "Male" },
    { name: "Megha", age: 19, gender: "Female" },
    { name: "Subham", age: 25, gender: "Male" },
]

const AssignFaculty = () => {
    const submit = useSubmit();
    const [params] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [remember, setRemember] = useState<boolean>(false);
    // check use of 'remember'. If it can be a different word, use canDelete

    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        // Fetch data from the API
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:5173/api/assignFaculty");
                const data = await response.json();
                setTableData(data); // Update state with fetched data
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []); // Empty dependency array ensures it runs only once when the component mounts

    useEffect(() => {
        if (params.get('error')) {
            setError(decodeURIComponent(params.get('error') ?? ''));
        }
        if (params.get('message')) {
            setMessage(decodeURIComponent(params.get('message') ?? ''));
        }
    }, [params]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        setError(null);
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const action = (
            (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
        ).name;
        if (formData.get('userEmail') === '') {
            setError('Please enter an email');
        } else {
            formData.append('action', action);
            submit(formData, { method: 'post' });
        }
    };

    return (
        <div className='w-full h-full flex justify-center items-center bg-gray-100'>
            <div className='flex w-full h-full sm:w-1/2 sm:h-auto sm:min-h-[50%] justify-center items-start shadow-md rounded-lg p-5 bg-white'>
                <Form
                    onSubmit={handleSubmit}
                    className='flex flex-col gap-2 w-full'
                >
                    <h1 className='text-3xl font-bold'>Assign Faculty Users</h1>
                    {error && <div className='text-red-500'>{error}</div>}
                    {message && <p className='text-green-500'>{message}</p>}
                    <Input
                        label='Enter user email:'
                        name='userEmail'
                        type='text'
                        placeholder='Email'
                        color='blue'
                        filled={false}
                    />
                    <Input
                        label='Can delete other faculty accounts'
                        name='cdf'
                        type='checkbox'
                        value='true'
                        checked={remember}
                        onChange={() => setRemember(!remember)}
                    />
                    <div className='flex flex-row gap-2'>
                        <Button
                            text='Apply user abilities'
                            type='submit'
                            name='assignFaculty'
                            color='blue'
                        />
                    </div>
                    <table border={1} style={{ borderCollapse: "collapse", width: "100%" }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Can Delete Faculty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((val, key) => {
                                return (
                                    <tr key={key}>
                                        <td>{val.name}</td>
                                        <td>{val.age}</td>
                                        <td>{val.gender}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </Form>
                
            </div>
        </div>
    );
};

export default AssignFaculty;