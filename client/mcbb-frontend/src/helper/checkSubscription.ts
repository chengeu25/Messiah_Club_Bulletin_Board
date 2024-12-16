/**
 * Checks the subscription status for a user in a specific club.
 * 
 * @param {string} email - The unique identifier of the user (typically their email address).
 * @param {number} clubId - The unique identifier of the club to check subscription for.
 * 
 * @returns {Promise<boolean>} A promise that resolves to:
 * - `true` if the user is subscribed to the club
 * - `false` if the user is not subscribed or if there was an error fetching the subscription status
 * 
 * @throws {Error} Logs any network or fetch-related errors to the console
 * 
 * @description This function makes an API call to check if a user is subscribed to a specific club.
 * It uses the base API URL from the environment variables and sends a POST request with user and club details.
 * In case of any network errors or non-successful responses, it returns `false` and logs the error.
 */
const checkSubscription = async (email: string, clubId: number) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/api/subscriptions/check-subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: email,
          clubId: clubId.toString()
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.isSubscribed;
    } else {
      console.error('Failed to fetch subscription status');
      return false;
    }
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return false;
  }
};

export default checkSubscription;
