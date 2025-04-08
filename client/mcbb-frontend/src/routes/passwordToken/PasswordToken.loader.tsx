import { LoaderFunction, redirect } from 'react-router';

const PasswordTokenLoader: LoaderFunction = async ({ request }) => {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/auth/password-token-check`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: new URL(request.url).searchParams.get('token')
                }),
                credentials: 'include'
            }
        );
        if (!response.ok) {
            throw new Error('Failed to fetch token data');
        }
        const tokenData = await response.json();
        console.log('Token data: ', tokenData);
        
    } catch (error) {
        console.error('Error fetching token data: ', error);
        return redirect('/forgot?message=Reset%20link%20expired');
    }
};

export default PasswordTokenLoader;