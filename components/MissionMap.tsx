'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Helper to handle map view changes smoothly
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        if (map) {
            // Use panTo for smooth movement instead of instant setView
            map.panTo(center, {
                animate: true,
                duration: 1.5
            })
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
    const [icons, setIcons] = useState<any>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        // Ensure Leaflet is only even LOADED in the browser
        if (typeof window !== 'undefined') {
            const L = require('leaflet')
            setIcons({
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
            })
        }
    }, [])

    const center: [number, number] = useMemo(() => [pilotLocation.lat, pilotLocation.lng], [pilotLocation.lat, pilotLocation.lng])

    if (!isMounted || !icons) {
        return (
            <div className="h-full w-full bg-slate-950 flex items-center justify-center text-white text-xs font-mono relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                <div className="z-10 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="tracking-widest animate-pulse">📡 ESTABLISHING SECURE CONNECTION...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full w-full relative">
            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-marker-icon {
                    transition: all 1.5s linear;
                }
                .leaflet-marker-shadow {
                    transition: all 1.5s linear;
                }
            `}} />
            <MapContainer
                center={center}
                zoom={14}
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
        </div>
    )
}
