import React, { useState, useEffect } from "react";

// Define a type for the device type state
type DeviceType = "mobile" | "tablet" | "desktop";

export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType("mobile");
      } else if (width >= 768 && width < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    // Set the initial device type
    handleResize();

    // Add event listener for resize
    window.addEventListener("resize", handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures this effect runs only once on mount

  return deviceType;
};
