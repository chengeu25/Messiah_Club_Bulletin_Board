import { ActionFunction, redirect } from 'react-router';
// import { useSearchParams } from 'react-router-dom';

const ForgotPasswordTokenAction: ActionFunction = async ({ request, params }) => {
    try {
        // const [params] = useSearchParams();
        const formData = await request.formData();
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');
        const token = formData.get('token');
        console.log("token: ", token);
        console.log("npw: ", newPassword);
        console.log("cnpw: ", confirmPassword);
        // console.log("Params received:", params);

        if (!token) {
            console.error("Token is missing from the parameters.");
            return redirect('/login?error=Token%20missing');
        }

        const loginRequest = await fetch(`http://localhost:3000/api/ForgotPasswordToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ token, newPassword, confirmPassword })
        });

        // Go to dashboard if password reset is successful
        if (loginRequest.ok) {
            return redirect('/dashboard?message=' + 'password%20reset%20successful');
        } else {
            let errorMessage = "an error has occured";
            if (loginRequest.headers.get('content-type')?.includes('application/json')) {
                try {
                    const json = await loginRequest.json();
                    errorMessage = json.error || errorMessage;
                } catch (e) {
                    console.error('Failed to parse error response as JSON:', e);
                }
            } else {
                console.warn('Non-JSON error response received');
            }
            return redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
            /*try {
                const json = await loginRequest.json();
                errorMessage = json.error || errorMessage;
            } catch (e) {
                console.error('Failed to parse error response:', e);
            }
            return redirect(`/login?error=${encodeURIComponent(errorMessage)}`);*/
        }
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return redirect('/login?error=Unexpected%20error');
    }
};

export default ForgotPasswordTokenAction;