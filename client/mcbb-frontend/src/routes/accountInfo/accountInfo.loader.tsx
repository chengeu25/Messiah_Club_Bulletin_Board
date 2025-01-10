import { json, LoaderFunction } from 'react-router-dom';

// Define the type for the expected account info
interface AccountInfo {
  name: string;
  email: string;
  // Add any other fields you expect to be returned
}

/**
 * Account info loader to fetch user account data.
 *
 * @function accountInfoLoader
 * @param {Request} request - The request object containing the route
 * @returns {Promise<any>} The response object containing user account info
 */
export const accountInfoLoader: LoaderFunction = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/user/account-info`,
      {
        credentials: 'include',
      }
    );

    // Parse the response as JSON and assert that it's of type AccountInfo
    const data: AccountInfo = await response.json();



    return json(data);
  } catch (error) {
    // Return error details with 500 status
    return json({ error: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 });
  }
};

export default accountInfoLoader;


