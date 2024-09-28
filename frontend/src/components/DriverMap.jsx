import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [20, 0]; // Default to a central world position
const DEFAULT_ZOOM = 2;

const DriverMap = ({ drivers, customerLocation }) => {
  const memoizedDrivers = useMemo(() => drivers, [drivers]);

  // Determine the center position
  const centerPosition = React.useMemo(() => {
    if (customerLocation) {
      return [customerLocation.latitude, customerLocation.longitude];
    }
    return DEFAULT_CENTER;
  }, [customerLocation, memoizedDrivers]);

  // Determine the zoom level
  const zoomLevel = centerPosition === DEFAULT_CENTER ? DEFAULT_ZOOM : 13;

  return (
    <MapContainer
      center={centerPosition}
      zoom={zoomLevel}
      style={{ height: "400px", width: "100%" }}
      key={`${centerPosition[0]}-${centerPosition[1]}`} // Force re-render on location change
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {memoizedDrivers &&
        memoizedDrivers.map((driver) => {
          return (
            <Marker
              key={driver.id}
              position={[driver.latitude, driver.longitude]}
            >
              <Popup>Driver ID: {driver.id}</Popup>
            </Marker>
          );
        })}

      {customerLocation &&
        typeof customerLocation.latitude === "number" &&
        typeof customerLocation.longitude === "number" && (
          <Marker
            position={[customerLocation.latitude, customerLocation.longitude]}
          >
            <Popup>Customer Location</Popup>
          </Marker>
        )}
    </MapContainer>
  );
};

export default DriverMap;
