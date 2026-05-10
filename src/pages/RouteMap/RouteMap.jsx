import React, { useState, useMemo, useCallback } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icon in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const INITIAL_ROUTES = [
  {
    id: "route1",
    name: "Route 1",
    color: "#6a53f6",
    stores: [
      { id: "s1", name: "Store A", position: [14.5995, 120.9842] },
      { id: "s2", name: "Store B", position: [14.6015, 120.9862] },
      { id: "s3", name: "Store C", position: [14.5975, 120.9882] },
    ],
  },
  {
    id: "route2",
    name: "Route 2",
    color: "#ef6d3c",
    stores: [
      { id: "s4", name: "Store D", position: [14.6050, 120.9900] },
      { id: "s5", name: "Store E", position: [14.6080, 120.9920] },
      { id: "s6", name: "Store F", position: [14.6040, 120.9950] },
      { id: "s7", name: "Store G", position: [14.6020, 120.9920] },
    ],
  },
];

const DraggableMarker = ({ store, routeId, onMove }) => {
  const eventHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;
        const position = marker.getLatLng();
        onMove(routeId, store.id, [position.lat, position.lng]);
      },
    }),
    [routeId, store.id, onMove]
  );

  return (
    <Marker
      position={store.position}
      draggable={true}
      eventHandlers={eventHandlers}
    >
      <Popup>
        <Typography variant="subtitle2">{store.name}</Typography>
        <Typography variant="caption">Drag to move</Typography>
      </Popup>
    </Marker>
  );
};

const RouteMap = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState(INITIAL_ROUTES);

  const handleMarkerMove = useCallback((routeId, storeId, newPosition) => {
    setRoutes((prevRoutes) =>
      prevRoutes.map((route) => {
        if (route.id === routeId) {
          return {
            ...route,
            stores: route.stores.map((store) =>
              store.id === storeId ? { ...store, position: newPosition } : store
            ),
          };
        }
        return route;
      })
    );
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "390px",
        minHeight: "100dvh",
        backgroundColor: "#ffffff",
        borderRadius: { xs: "0px", sm: "32px" },
        boxShadow: { xs: "none", sm: "0 22px 80px rgba(42, 52, 84, 0.12)" },
        mx: "auto",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center", borderBottom: "1px solid #eee" }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/")}
          sx={{ color: "#161d2d", textTransform: "none", fontWeight: 700 }}
        >
          Back
        </Button>
        <Typography variant="h6" sx={{ ml: 2, fontWeight: 700 }}>
          Route Map
        </Typography>
      </Box>

      <Box sx={{ flex: 1, position: "relative" }}>
        <MapContainer
          center={[14.6000, 120.9850]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {routes.map((route) => (
            <React.Fragment key={route.id}>
              <Polygon
                positions={route.stores.map((s) => s.position)}
                pathOptions={{ color: route.color, fillColor: route.color, fillOpacity: 0.3 }}
              />
              {route.stores.map((store) => (
                <DraggableMarker
                  key={store.id}
                  store={store}
                  routeId={route.id}
                  onMove={handleMarkerMove}
                />
              ))}
            </React.Fragment>
          ))}
        </MapContainer>

        <Paper
          sx={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 1000,
            p: 1.5,
            borderRadius: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(4px)",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#747b8c" }}>
            LEGEND
          </Typography>
          <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
            {routes.map((route) => (
              <Box key={route.id} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: route.color,
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {route.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default RouteMap;
