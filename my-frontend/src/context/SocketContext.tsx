import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Create socket connection
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket'],
        autoConnect: true
      });

      newSocket.on('connect', () => {
        console.log('🔌 Connected to Socket.io');
        setIsConnected(true);
        
        // Join with user ID
        try {
          const userData = JSON.parse(atob(token.split('.')[1]));
          newSocket.emit('join', userData.id);
        } catch (err) {
          console.error('Error parsing token:', err);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from Socket.io');
        setIsConnected(false);
      });

      setSocket(newSocket);

      // Cleanup
      return () => {
        newSocket.close();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
