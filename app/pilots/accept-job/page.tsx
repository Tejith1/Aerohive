'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, MapPin, Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function AcceptJobPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const id = searchParams.get('id')
    const [job, setJob] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [accepting, setAccepting] = useState(false)
    const [error, setError] = useState('')
    const [otpInput, setOtpInput] = useState('')
    const [verifying, setVerifying] = useState(false)

    useEffect(() => {
        if (id) {
            fetchJobDetails(id)
        } else {
            setError('Missing Job ID')
            setLoading(false)
        }
    }, [id])

    const fetchJobDetails = async (uuid: string) => {
        try {
            const res = await fetch(`/api/jobs/details?uuid=${uuid}`)
            if (!res.ok) throw new Error('Failed to load job details')
            const data = await res.json()
            setJob(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async () => {
        if (!id) return
        setAccepting(true)
        try {
            const res = await fetch('/api/jobs/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderUUID: id })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to accept job')

            toast.success("Job Accepted Successfully!")
            // Refresh details
            fetchJobDetails(id)
        } catch (err: any) {
            toast.error(err.message)
            setError(err.message)
        } finally {
            setAccepting(false)
        }
    }

    const handleStartMission = async () => {
        if (!id || !otpInput) {
            toast.error("Please enter the Client OTP")
            return
        }
        setVerifying(true)
        try {
            const res = await fetch('/api/jobs/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderUUID: id, otp: otpInput })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Verification failed')

            toast.success("Mission Started! Tracking Enabled.")
            fetchJobDetails(id)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setVerifying(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-700 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-red-600">
                        {error}
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!job) return null

    const isPending = job.status === 'PENDING'
    const isAccepted = job.status === 'ACCEPTED'
    const isInProgress = job.status === 'IN_PROGRESS'
    const isCompleted = job.status === 'completed' || job.status === 'confirmed' // Mapping legacy statuses

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">AeroHive Pilot Portal</h1>
                    <p className="mt-2 text-gray-600">Secure Job Acceptance</p>
                </div>

                <Card className="shadow-lg border-t-4 border-t-primary">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl">Job {job.id}</CardTitle>
                                <CardDescription className="uppercase font-semibold tracking-wider mt-1 text-xs">
                                    {job.serviceType}
                                </CardDescription>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                ${isPending ? 'bg-amber-100 text-amber-800' :
                                    isInProgress ? 'bg-blue-100 text-blue-800' :
                                        isAccepted ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                {job.status.replace('_', ' ')}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Status Message */}
                        {isAccepted && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <div>
                                    <p className="font-semibold text-green-800">Job Accepted</p>
                                    <p className="text-green-700 text-sm">Please proceed to location. Ask client for OTP to start.</p>
                                </div>
                            </div>
                        )}

                        {isInProgress && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                <div>
                                    <p className="font-semibold text-blue-800">Mission In Progress</p>
                                    <p className="text-blue-700 text-sm">Live tracking is active.</p>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4">
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
                                <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Schedule</p>
                                    <p className="text-sm text-slate-600">
                                        {new Date(job.scheduledAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Duration: ~{job.durationHours} hrs</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
                                <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Location</p>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${job.lat},${job.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                    >
                                        Open Maps Link
                                    </a>
                                </div>
                            </div>

                            {/* Verification Section */}
                            {isAccepted && (
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="font-semibold text-slate-900 mb-2">Start Mission</p>
                                    <p className="text-xs text-slate-500 mb-3">Enter the 4-digit OTP provided by the client to verify and start tracking.</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            maxLength={4}
                                            placeholder="OTP"
                                            className="w-20 p-2 text-center text-lg font-mono tracking-widest border rounded outline-none focus:ring-2 focus:ring-primary"
                                            value={otpInput}
                                            onChange={(e) => setOtpInput(e.target.value)}
                                        />
                                        <Button onClick={handleStartMission} disabled={verifying || otpInput.length < 4} className="flex-1">
                                            {verifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : '🚀'}
                                            {verifying ? 'Verifying...' : 'Start Mission'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Estimate */}
                            {job.estimatedAmount > 0 && (
                                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-md text-sm font-medium text-center">
                                    💰 Estimated Earnings: ₹{job.estimatedAmount}
                                </div>
                            )}

                        </div>
                    </CardContent>
                    <CardFooter>
                        {isPending && (
                            <Button
                                className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                                onClick={handleAccept}
                                disabled={accepting}
                            >
                                {accepting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : '✓'}
                                {accepting ? 'Accepting...' : 'Accept Job'}
                            </Button>
                        )}

                        {(isInProgress || isCompleted) && (
                            <Button className="w-full" variant="outline" disabled>
                                {isInProgress ? 'Mission Active' : 'Status: ' + job.status}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
