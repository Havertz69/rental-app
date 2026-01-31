import { Toaster as HotToaster } from 'react-hot-toast';

export const ToasterComponent = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#4aed88',
            secondary: '#fff',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ff6b6b',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

// Default export for easy imports
export default ToasterComponent;
