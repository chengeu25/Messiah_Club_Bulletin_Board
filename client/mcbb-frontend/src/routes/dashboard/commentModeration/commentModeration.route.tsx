import React, { useEffect, useState } from 'react';
import { Form, redirect, useLoaderData, useSubmit } from 'react-router-dom';
import useLoading from '../../../hooks/useLoading';
import { useNotification } from '../../../contexts/NotificationContext';
import ReportedComment from '../../../components/reportedComments/reportedComment.component';

const commentModeration = () => {
    const { loading } = useLoading();
    const { addNotification } = useNotification();
    const [tableData, setTableData] = useState<any[]>([]);
    const submit = useSubmit();

    const { comments } = useLoaderData() as {
        comments: any[];
        loaderError: String | null;
    };

    useEffect(() => {
        setTableData(comments);
    }, [comments]);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
        item: any
    ) => {
        event.preventDefault(); // Prevent page reload.
        const formData = new FormData(event.currentTarget);
        const action = (
            (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
        ).name;
        const email = formData.get('userId') as string;
        formData.append('action', action);
        formData.append('email', email);

        if (action === 'approve') {
            try {
                await submit(
                    {
                        comment_id: item.comment_id.toString(),
                        action: 'approve'
                     },
                    { method: 'POST' }
                );

                // After successful submission:
                addNotification('Comment approved successfully', 'success');
            } catch (error) {
                console.error(error);
                addNotification('Error approving comment', 'error');
                return redirect(`/dashboard/faculty/comentModeration`);
            }
            return redirect(`/dashboard/faculty/commentModeration`);
        } else if (action === 'decline') {
            try {
                await submit(
                    {
                        comment_id: item.comment_id.toString(),
                        action: 'decline'
                    },
                    { method: 'POST' }
                );

                // After successful submission:
                addNotification('Comment declined successfully', 'success');
            } catch (error) {
                console.error(error);
                addNotification('Error declining comment', 'error');
                return redirect(`/dashboard/faculty/commentModeration`);
            }
            return redirect(`/dashboard/faculty/commentModeration`);
        } 
    }

    return (
        <div className='w-full h-full flex justify-center items-center'>
            <div className='flex flex-col w-full sm:w-3/4 min-h-[30vh] max-h-[70vh] overflow-y-auto justify-start items-start shadow-md rounded-lg p-5 bg-white'>
            <h1 className='text-3xl font-bold mb-4'>Reported Comments</h1>
                <div className='flex flex-col gap-2 w-full'>
                    {loading ? <div>Loading...</div> : null}
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