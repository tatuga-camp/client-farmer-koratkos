import { useState } from "react";

export const useGeolocation = () => {
  // State to store location data, loading status, and errors
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to get the user's current position
  const getLocation = () => {
    // Check if the Geolocation API is supported by the browser
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLocation(null); // Reset location on new request

    // Request the current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success callback
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        // Error callback
        let errorMessage = "An unknown error occurred.";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "You denied the request for Geolocation.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case err.TIMEOUT:
            errorMessage = "The request to get user location timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred.";
        }
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        // Options for the geolocation request
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // Return the state and the function to be used by components
  return { location, isLoading, error, getLocation };
};
