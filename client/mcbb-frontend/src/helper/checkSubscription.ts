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
