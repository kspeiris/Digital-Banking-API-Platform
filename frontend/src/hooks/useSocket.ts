import { useEffect, useRef } from 'react';

export function useSocket(event: string, callback: (data: any) => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    // Simulated Socket.IO connection client stub
    console.log(`[SocketStub] Subscribed to real-time event: ${event}`);

    // Set up a simulated notification interval to display real-time features
    const interval = setInterval(() => {
      if (event === 'notification:new') {
        callbackRef.current({
          id: Math.random().toString(),
          title: 'Money Received',
          message: 'LKR 2,500.00 was credited to your savings account.',
          createdAt: new Date().toISOString(),
        });
      }
    }, 60000); // Send mock event every 60 seconds

    return () => {
      clearInterval(interval);
      console.log(`[SocketStub] Cleaned up real-time event subscription for: ${event}`);
    };
  }, [event]);
}
export default useSocket;
