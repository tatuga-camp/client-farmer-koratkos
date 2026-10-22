import { useState } from "react";

export const useGeolocation = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("โทรศัพท์หรือเบราว์เซอร์นี้หาตำแหน่งไม่ได้ กรุณากรอกพิกัดเอง");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLocation(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        let errorMessage = "หาตำแหน่งไม่สำเร็จ ลองกดอีกครั้ง หรือกรอกพิกัดเอง";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage =
              "ยังไม่ได้อนุญาตให้ใช้ตำแหน่ง ให้กด “อนุญาต” เมื่อมีหน้าต่างถาม หรือเปิดสิทธิ์ตำแหน่งในการตั้งค่าเบราว์เซอร์ แล้วกดอีกครั้ง";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "ยังหาตำแหน่งไม่ได้ ให้เปิด GPS ของโทรศัพท์ แล้วออกไปที่โล่งก่อนกดอีกครั้ง";
            break;
          case err.TIMEOUT:
            errorMessage = "หาตำแหน่งนานเกินไป ลองกดอีกครั้งในที่โล่ง หรือกรอกพิกัดเอง";
            break;
        }
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  return { location, isLoading, error, getLocation };
};
