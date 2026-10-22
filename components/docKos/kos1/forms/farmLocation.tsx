import React, { useEffect, useState } from "react";
import { LuLoader2, LuLocateFixed, LuMap } from "react-icons/lu";
import { FieldErrorText, NumberField, StorageImage } from "../../../ui";
import { GetStaticMapService } from "../../../../services/map";
import { errorMessage } from "../../../../utils/confirm";
import { FieldErrors } from "../../../../utils/validators";
import { useGeolocation } from "../../../../utils";

export type LocationValue = {
  latitude: string;
  longitude: string;
  mapHybrid?: string;
  mapTerrain?: string;
};

type FarmLocationProps = {
  value: LocationValue;
  onChange: (patch: Partial<LocationValue>) => void;
  errors: FieldErrors;
  touch: (name: string) => void;
};

function MapImage({ src, caption }: { src: string; caption: string }) {
  return (
    <figure className="m-0 flex flex-col gap-1.5">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-third-color/50 bg-fourth-color">
        <StorageImage
          src={src}
          alt={`${caption}ของแปลง`}
          sizes="(max-width: 640px) 100vw, 420px"
          className="object-cover"
          loadingText="กำลังโหลดแผนที่…"
          failedText="โหลดรูปแผนที่ไม่สำเร็จ"
        />
      </div>
      <figcaption className="text-center text-base text-super-main-color/80">{caption}</figcaption>
    </figure>
  );
}

/** GPS button, latitude/longitude boxes and the satellite + terrain map check. */
export function FarmLocation({ value, onChange, errors, touch }: FarmLocationProps) {
  const { location, error: gpsError, getLocation, isLoading: locating } = useGeolocation();
  const [loadingMap, setLoadingMap] = useState(false);
  const [mapError, setMapError] = useState<string>();

  const loadMap = async (latitude: string, longitude: string) => {
    try {
      setLoadingMap(true);
      setMapError(undefined);
      const [hybrid, terrain] = await Promise.all([
        GetStaticMapService({ maptype: "hybrid", lat: latitude, lng: longitude }),
        GetStaticMapService({ maptype: "terrain", lat: latitude, lng: longitude }),
      ]);
      onChange({ mapHybrid: hybrid.imageURL, mapTerrain: terrain.imageURL });
    } catch (error) {
      setMapError(`โหลดแผนที่ไม่สำเร็จ: ${errorMessage(error)}`);
    } finally {
      setLoadingMap(false);
    }
  };

  // A GPS fix fills both boxes and shows the map straight away.
  useEffect(() => {
    if (!location) return;
    const latitude = location.latitude.toFixed(6);
    const longitude = location.longitude.toFixed(6);
    onChange({ latitude, longitude, mapHybrid: undefined, mapTerrain: undefined });
    touch("latitude");
    touch("longitude");
    loadMap(latitude, longitude);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Typing new coordinates invalidates the map that was checked for the old ones.
  const setCoordinate = (key: "latitude" | "longitude", next: string) =>
    onChange({ [key]: next, mapHybrid: undefined, mapTerrain: undefined });

  const coordinatesValid = !errors.latitude && !errors.longitude && value.latitude !== "" && value.longitude !== "";
  const hasMap = !!value.mapHybrid && !!value.mapTerrain;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <button type="button" onClick={getLocation} disabled={locating} className="btn btn-dark w-full sm:w-fit">
          {locating ? (
            <LuLoader2 aria-hidden="true" className="size-5 motion-safe:animate-spin" />
          ) : (
            <LuLocateFixed aria-hidden="true" className="size-5" />
          )}
          {locating ? "กำลังหาตำแหน่ง…" : "ใช้ตำแหน่งปัจจุบัน"}
        </button>
        <p className="hint">กดปุ่มนี้ตอนยืนอยู่ในแปลง หรือกรอกพิกัดเองด้านล่าง (ดูได้จาก Google Maps โดยกดค้างที่แปลง)</p>
        {gpsError && <FieldErrorText>{gpsError}</FieldErrorText>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField
          id="latitude"
          label="ละติจูด (Latitude)"
          hint="ตัวเลขชุดแรก เช่น 14.713500"
          value={value.latitude}
          onChange={(next) => setCoordinate("latitude", next)}
          onBlur={() => touch("latitude")}
          error={errors.latitude}
        />
        <NumberField
          id="longitude"
          label="ลองจิจูด (Longitude)"
          hint="ตัวเลขชุดที่สอง เช่น 101.420700"
          value={value.longitude}
          onChange={(next) => setCoordinate("longitude", next)}
          onBlur={() => touch("longitude")}
          error={errors.longitude}
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          id="map"
          type="button"
          data-invalid={errors.map ? true : undefined}
          aria-describedby={errors.map || mapError ? "map-error" : undefined}
          disabled={!coordinatesValid || loadingMap}
          onClick={() => loadMap(value.latitude, value.longitude)}
          className={`btn w-full sm:w-fit ${hasMap ? "btn-secondary" : "btn-primary"}`}
        >
          {loadingMap ? (
            <LuLoader2 aria-hidden="true" className="size-5 motion-safe:animate-spin" />
          ) : (
            <LuMap aria-hidden="true" className="size-5" />
          )}
          {loadingMap ? "กำลังโหลดแผนที่…" : hasMap ? "โหลดแผนที่ใหม่" : "ดูแผนที่แปลง"}
        </button>
        {!coordinatesValid && !hasMap && <p className="hint">กรอกพิกัดให้ถูกต้องก่อน แล้วจึงกดดูแผนที่</p>}
        {(errors.map || mapError) && <FieldErrorText id="map-error">{mapError ?? errors.map}</FieldErrorText>}

        {loadingMap ? (
          <div className="grid gap-3 sm:grid-cols-2" aria-hidden="true">
            <div className="aspect-square animate-pulse rounded-xl bg-third-color/20" />
            <div className="aspect-square animate-pulse rounded-xl bg-third-color/20" />
          </div>
        ) : (
          hasMap && (
            <>
              <p className="text-base font-semibold text-main-color">ตรวจดูว่าหมุดสีแดงอยู่ตรงแปลงของคุณ ถ้าไม่ใช่ ให้แก้พิกัดแล้วกดโหลดแผนที่ใหม่</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { src: value.mapHybrid as string, caption: "ภาพดาวเทียม" },
                  { src: value.mapTerrain as string, caption: "แผนที่ภูมิประเทศ" },
                ].map((map) => (
                  <MapImage key={map.caption} src={map.src} caption={map.caption} />
                ))}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
