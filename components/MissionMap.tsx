'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

const droneIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3211/3211388.png', // Drone icon
    iconSize: [32, 32],
    iconAnchor: [16, 16],
})

export interface MissionMapProps {
    pilotLocation: { lat: number, lng: number }
    clientLocation: { lat: number, lng: number }
    bookingId: string
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap()
    map.setView(center, map.getZoom())
    return null
}

export default function MissionMap({ pilotLocation, clientLocation, bookingId }: MissionMapProps) {
    const center: [number, number] = [pilotLocation.lat, pilotLocation.lng]

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={center} />

            {/* Client Marker */}
            <Marker position={[clientLocation.lat, clientLocation.lng]} icon={icon}>
                <Popup>Your Location</Popup>
            </Marker>

            {/* Pilot/Drone Marker */}
            <Marker position={[pilotLocation.lat, pilotLocation.lng]} icon={droneIcon}>
                <Popup>
                    <div className="text-xs">
                        <p className="font-bold">Pilot Live Location</p>
                        <p className="text-[10px] text-muted-foreground">{bookingId}</p>
                    </div>
                </Popup>
            </Marker>
        </MapContainer>
    )
}
