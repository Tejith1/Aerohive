'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'

// Helper to handle map view changes
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        if (map) {
            map.setView(center, 13)
        }
    }, [center, map])
    return null
}

export interface MissionMapProps {
    pilotLocation: { lat: number, lng: number }
    clientLocation: { lat: number, lng: number }
    bookingId: string
}

export default function MissionMap({ pilotLocation, clientLocation, bookingId }: MissionMapProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const center: [number, number] = useMemo(() => [pilotLocation.lat, pilotLocation.lng], [pilotLocation.lat, pilotLocation.lng])

    const icons = useMemo(() => {
        if (typeof window === 'undefined') return null

        return {
            defaultIcon: L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            }),
            droneIcon: L.icon({
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/3211/3211388.png',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            })
        }
    }, [])

    if (!isMounted || !icons) {
        return <div className="h-full w-full bg-slate-950 animate-pulse flex items-center justify-center text-white text-xs font-mono">📡 ESTABLISHING SECURE CONNECTION...</div>
    }

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

            <Marker position={[clientLocation.lat, clientLocation.lng]} icon={icons.defaultIcon}>
                <Popup>Your Location</Popup>
            </Marker>

            <Marker position={[pilotLocation.lat, pilotLocation.lng]} icon={icons.droneIcon}>
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
