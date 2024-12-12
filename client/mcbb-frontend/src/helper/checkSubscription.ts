const checkSubscription = async (email: string, clubId: number) => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/check_subscription',
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


export const someAsync = async (array: any[], callback: (value: any, index: number, array: any[]) => unknown) => {
    const results = await Promise.all(array.map(callback));
    return results.some(result => result);
}

export default checkSubscription;