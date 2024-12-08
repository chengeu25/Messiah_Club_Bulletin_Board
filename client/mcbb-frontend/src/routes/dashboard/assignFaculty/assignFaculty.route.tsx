import React, { useEffect, useState } from 'react';
import { Form, useSubmit, useSearchParams } from 'react-router-dom';
import Input from '../../../components/formElements/Input.component';
import Button from '../../../components/formElements/Button.component';

const AssignFaculty = () => {
    const submit = useSubmit();
    const [params] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [canDelete, setCanDelete] = useState<boolean>(false);
    const [tableData, setTableData] = useState < { name: string; email: string; can_delete_faculty: boolean }[]>([]);

    useEffect(() => {
        // Fetch data from the API
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/getFacultyData");
                if (!response.ok) {
                    throw new Error("failed to fetch data");
                }
                const data = await response.json();
                setTableData(data); // Update state with fetched data
            } catch (error) {
                setError("Error fetching data from the server");
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
            formData.append("canDelete", canDelete ? "true" : "false");
            submit(formData, { method: "POST" });
        }
    };

    const deleteFaculty = async (item: { name: string; email: string; can_delete_faculty: boolean }) => {
        try {
            const response = await fetch("http://localhost:3000/api/removeFaculty", {
                method: "POST",
                body: JSON.stringify({ email: item.email }),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error("Failed to remove admin");

            setTableData((prev) => prev.filter((row) => row.email !== item.email));
        } catch (error) {
            console.error(error);
            setError("Failed to remove admin. Please try again.");
        }
    };

    const tableStyles: React.CSSProperties = {
        textAlign: "center",
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
                        value='false'
                        checked={canDelete}
                        onChange={() => setCanDelete(!canDelete)}
                    />
                    <div className='flex flex-row gap-2'>
                        <Button
                            text='Apply user abilities'
                            type='submit'
                            name='assignFaculty'
                            color='blue'
                        />
                    </div>
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Can Delete Faculty</th>
                                <th>Remove Admin Abilities</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.length > 0 ? (
                                tableData.map((item, index) => (
                                    <tr key={index}>
                                        <td style={tableStyles}>{item.name}</td>
                                        <td style={tableStyles}>{item.email}</td>
                                        <td style={tableStyles}>{item.can_delete_faculty ? 'Yes' : 'No'}</td>
                                        <td style={tableStyles}>
                                            <button
                                                onClick={(event) => {
                                                    event.preventDefault(); // Prevent the form submission
                                                    deleteFaculty(item); // Call the deleteFaculty function
                                                }}
                                                aria-label={`Remove ${item.name} from faculty`}
                                                style={{
                                                    padding: "5px 10px",
                                                    backgroundColor: "blue",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "5px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="no-data">
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Form>
                
            </div>
        </div>
    );
};

export default AssignFaculty;