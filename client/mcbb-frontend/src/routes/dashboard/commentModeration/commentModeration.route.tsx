import React, { useEffect, useState } from 'react';
import { Form, redirect, useLoaderData } from 'react-router-dom';
import useLoading from '../../../hooks/useLoading';
import Loading from '../../../components/ui/Loading';
import ReportedComment from '../../../components/reportedComments/reportedComment.component';

/*type LoaderData = {
    user: User;
    comments: CommentData[];
    searchQuery: String;
    loaderError: String | null;
}*/

const commentModeration = () => {
    const { loading, setLoading } = useLoading();
    const [tableData, setTableData] = useState<any[]>([]);
    const [error, setError] = useState<String | null>(null);

    const { comments, loaderError } = useLoaderData() as {
        comments: any[];
        loaderError: String | null;
    };

    if (loaderError) {
        setError(loaderError);
    }

    useEffect(() => {
        setTableData(comments);
    }, [comments]);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
        item: any
    ) => {
        event.preventDefault(); // Prevent page reload.
        setError(null); // Reset error message.
        const formData = new FormData(event.currentTarget);
        const action = (
            (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
        ).name;
        const email = formData.get('userId') as string;
        formData.append('action', action);
        formData.append('email', email);

        if (action === 'approve') {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/api/admintools/approve-comment`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            comment_id: item.comment_id
                        })
                    }
                );
                if (!response.ok) {
                    alert(
                        `Something went wrong, comment not approved. Error: ${response.statusText}`
                    );
                    return null;
                }

                // Update the tableData state to remove the approved comment
                setTableData((prevData) =>
                    prevData.filter((row) => row.comment_id !== item.comment_id)
                );
            } catch (error) {
                console.error(error);
                return redirect(`/dashboard/comentModeration`);
            }
            return redirect(`/dashboard/commentModeration`);
        } else if (action === 'decline') {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/api/admintools/delete-comment`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            comment_id: item.comment_id
                        })
                    }
                );
                if (!response.ok) {
                    alert(
                        `Something went wrong, comment not deleted. Error: ${response.statusText}`
                    );
                    return null;
                }

                // Update the tableData state to remove the declined comment
                setTableData((prevData) =>
                    prevData.filter((row) => row.comment_id !== item.comment_id)
                );
            } catch (error) {
                console.error(error);
                return redirect(`/dashboard/commentModeration`);
            }
            return redirect(`/dashboard/commentModeration`);
        } 
    }

    return loading ? (
        <Loading />
    ) : (
        <div className='w-full h-full flex justify-center items-center'>
            <div className='flex flex-col w-full h-full sm:w-3/4 sm:h-auto sm:min-h-[50%] justify-start items-start shadow-md rounded-lg p-5 bg-white'>
            <h1 className='text-3xl font-bold mb-4'>Reported Comments</h1>
            <div className='flex flex-col gap-2 w-full'>
                {tableData && tableData.length > 0 ? (
                comments.map((item, index) => (
                    <Form
                    key={index}
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(e, item);
                        }}
                    className='flex flex-col gap-2 w-full'
                    >
                        <ReportedComment
                            commentId={item.comment_id}
                            content={item.content}
                            eventId={item.event_id}
                            isDeleted={item.is_deleted}
                            parentId={item.parent_id}
                            lastModified={new Date(item.posted_timestamp)}
                            userId={item.user_id}
                            submitHandler={(e) => handleSubmit(e, item)}
                        />
                    </Form>
                ))
                ) : (
                <div>No reported comments available</div>
                )}
            </div>
            </div>
        </div>
    );
};

export default commentModeration;