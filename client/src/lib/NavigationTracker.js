import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page navigation
    console.log('Navigated to:', location.pathname);
    
    // You can add analytics tracking here
    // Example: gtag('config', 'GA_MEASUREMENT_ID', { page_path: location.pathname });
  }, [location]);

  return null;
};

export default NavigationTracker;
