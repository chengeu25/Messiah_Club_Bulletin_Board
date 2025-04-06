import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

const commentModerationLoader: LoaderFunction = async ({ request }) => {
    const user = await checkUser();
    if (user === false)
        return redirect('/login?serviceTo=' + new URL(request.url).pathname);
    if ((user as User).emailVerified === false)
        return redirect('/verifyEmail');
    if ((user as User).isFaculty === false) {
        return redirect('/dashboard/home');
    }

    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL
            }/api/admintools/get-reported-comments`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch comments');
        }

        const comments = await response.json();

        return json(
            {
                user: user,
                comments: comments,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching comments: ', error);
        return json(
            {
                user: user,
                comments: [],
                loaderError: 'Failed to fetch comments'
            },
            { status: 500 }
        );
    }
};

export default commentModerationLoader;