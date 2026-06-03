"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Search, ShieldCheck, Mail, MapPin, Award } from "lucide-react"
import { getSupabaseAdmin, supabase, DronePilot } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export default function PilotApprovals() {
  const [pilots, setPilots] = useState<DronePilot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPilot, setSelectedPilot] = useState<DronePilot | null>(null)
  
  // Rejection & Reminder States
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectFeedback, setRejectFeedback] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)

  useEffect(() => {
    fetchPilots()

    // Set up real-time subscription for drone pilots
    if (!supabase) return

    const channel = supabase
      .channel('admin_drone_pilots_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'drone_pilots'
        },
        (payload: any) => {
          console.log('Real-time pilot change detected:', payload)
          // Refresh the list when a change is detected
          fetchPilots()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPilots = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('drone_pilots')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPilots(data || [])
    } catch (error) {
      console.error('Error fetching pilots:', error)
      toast({ title: "Error", description: "Could not load pilots", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const parseAcademyDetails = (droneAcademy: string | null | undefined) => {
    if (!droneAcademy) return { aadhar: "N/A", dob: "N/A", address: "N/A", gender: "N/A", blood: "N/A", emergency: "N/A", pan: "N/A" }
    const aadharMatch = droneAcademy.match(/AADHAR:\s*([^|]+)/i)
    const dobMatch = droneAcademy.match(/DOB:\s*([^|]+)/i)
    const addressMatch = droneAcademy.match(/HOME:\s*([^|]+)/i)
    const genderMatch = droneAcademy.match(/GENDER:\s*([^|]+)/i)
    const bloodMatch = droneAcademy.match(/BLOOD:\s*([^|]+)/i)
    const emergencyMatch = droneAcademy.match(/EMERGENCY:\s*([^|]+)/i)
    const panMatch = droneAcademy.match(/PAN:\s*([^|]+)/i)
    return {
      aadhar: aadharMatch ? aadharMatch[1].trim() : "N/A",
      dob: dobMatch ? dobMatch[1].trim() : "N/A",
      address: addressMatch ? addressMatch[1].trim() : "N/A",
      gender: genderMatch ? genderMatch[1].trim() : "N/A",
      blood: bloodMatch ? bloodMatch[1].trim() : "N/A",
      emergency: emergencyMatch ? emergencyMatch[1].trim() : "N/A",
      pan: panMatch ? panMatch[1].trim() : "N/A"
    }
  }

  const isProfileIncomplete = (pilot: DronePilot) => {
    const details = parseAcademyDetails(pilot.drone_academy)
    return (
      !pilot.dgca_number ||
      pilot.dgca_number.trim() === "" ||
      !pilot.experience ||
      pilot.experience.trim() === "" ||
      pilot.experience.toLowerCase() === "none" ||
      !pilot.specializations ||
      pilot.specializations.trim() === "" ||
      pilot.specializations.toLowerCase() === "none" ||
      !pilot.about ||
      pilot.about.trim() === "" ||
      !pilot.profile_image_url ||
      !pilot.certificate_image_url ||
      details.aadhar === "N/A" ||
      details.dob === "N/A" ||
      details.address === "N/A"
    )
  }

  const approvePilot = async (id: string) => {
    try {
      const response = await fetch('/api/admin/pilots/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilotId: id })
      })

      if (!response.ok) {
        throw new Error('Approval request failed')
      }
      
      toast({
        title: "Approved & Notified",
        description: "Pilot has been successfully verified and sent an approval confirmation email.",
        className: "bg-green-50 text-green-900 border-green-200"
      })
      
      // Update state, clearing certifications if it starts with REJECTED:
      setPilots(pilots.map(p => {
        if (p.id === id) {
          let certs = p.certifications
          if (p.certifications && p.certifications.startsWith('REJECTED:')) {
            certs = ''
          }
          return { ...p, is_verified: true, is_active: true, certifications: certs }
        }
        return p
      }))
      setSelectedPilot(null)
    } catch (error) {
      console.error('Error approving pilot:', error)
      toast({ title: "Error", description: "Failed to approve pilot and dispatch email.", variant: "destructive" })
    }
  }

  const handleRejectSubmit = async (id: string) => {
    try {
      setIsRejecting(true)
      const response = await fetch('/api/admin/pilots/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilotId: id, feedback: rejectFeedback })
      })

      if (!response.ok) {
        throw new Error('Rejection request failed')
      }
      
      toast({
        title: "Rejected & Notified",
        description: "Pilot has been rejected and email sent successfully.",
        className: "bg-red-50 text-red-900 border-red-200"
      })
      
      setPilots(pilots.filter(p => p.id !== id))
      setSelectedPilot(null)
      setShowRejectForm(false)
      setRejectFeedback("")
    } catch (error) {
      console.error('Error rejecting pilot:', error)
      toast({ title: "Error", description: "Failed to reject pilot", variant: "destructive" })
    } finally {
      setIsRejecting(false)
    }
  }

  const sendProfileReminder = async (id: string) => {
    try {
      toast({
        title: "Sending Reminder...",
        description: "Please wait while we audit profile and send the email reminder."
      })

      const response = await fetch('/api/admin/pilots/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilotId: id })
      })

      if (!response.ok) {
        throw new Error('Reminder request failed')
      }

      toast({
        title: "Reminder Sent",
        description: "Profile completion email has been sent successfully.",
        className: "bg-green-50 text-green-900 border-green-200"
      })
    } catch (error) {
      console.error('Error sending reminder:', error)
      toast({ title: "Error", description: "Failed to send email reminder", variant: "destructive" })
    }
  }

  const resetRejection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('drone_pilots')
        .update({ 
          is_verified: false, 
          is_active: true, 
          certifications: '' 
        })
        .eq('id', id)

      if (error) throw error
      
      toast({
        title: "Application Reopened",
        description: "The pilot application has been moved back to Needs Approval.",
        className: "bg-green-50 text-green-900 border-green-200"
      })
      
      setPilots(pilots.map(p => p.id === id ? { ...p, is_verified: false, is_active: true, certifications: '' } : p))
    } catch (error) {
      console.error('Error resetting rejection:', error)
      toast({ title: "Error", description: "Failed to reset status", variant: "destructive" })
    }
  }

  const filteredPilots = pilots.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingPilots = filteredPilots.filter(p => !p.is_verified && !p.certifications?.startsWith('REJECTED:'))
  const approvedPilots = filteredPilots.filter(p => p.is_verified)
  const rejectedPilots = filteredPilots.filter(p => !p.is_verified && p.certifications?.startsWith('REJECTED:'))

  const renderRejectedRow = (pilot: DronePilot) => (
    <TableRow key={pilot.id}>
      <TableCell className="font-medium text-slate-900">{pilot.full_name}</TableCell>
      <TableCell>{pilot.email}</TableCell>
      <TableCell className="text-red-700 font-medium max-w-xs truncate">
        {pilot.certifications?.replace('REJECTED:', '').trim() || 'No reason provided.'}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
          <XCircle className="w-3 h-3 mr-1" /> Rejected
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-blue-700 border-blue-200 hover:bg-blue-50"
            onClick={() => resetRejection(pilot.id)}
          >
            Re-Review
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )

  const renderPilotRow = (pilot: DronePilot) => (
    <TableRow key={pilot.id}>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{pilot.full_name}</span>
          {isProfileIncomplete(pilot) && (
            <span className="inline-flex items-center text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 mt-1 w-max font-medium">
              Incomplete Profile
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>{pilot.email}</TableCell>
      <TableCell>{pilot.location} - {pilot.area}</TableCell>
      <TableCell>
        <Badge variant={pilot.is_verified ? "default" : "secondary"} className={pilot.is_verified ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-blue-100 text-blue-800 hover:bg-blue-200"}>
          {pilot.is_verified ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
          {pilot.is_verified ? "Approved" : "Pending"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end items-center gap-2">
          {isProfileIncomplete(pilot) && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-200 h-8"
              onClick={() => sendProfileReminder(pilot.id)}
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" /> Remind
            </Button>
          )}
          <Dialog onOpenChange={(open) => {
            if (!open) {
              setShowRejectForm(false);
              setRejectFeedback("");
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8" onClick={() => {
                setSelectedPilot(pilot);
                setShowRejectForm(false);
                setRejectFeedback("");
              }}>
                Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Pilot Application Details</DialogTitle>
                <DialogDescription>Review the details provided by the pilot during registration.</DialogDescription>
              </DialogHeader>
              {selectedPilot && (
                <div className="grid grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500">Personal Info</h4>
                      <p className="text-lg font-medium mt-1">{selectedPilot.full_name}</p>
                      <div className="flex items-center text-sm text-slate-600 mt-1.5"><Mail className="w-4 h-4 mr-2" /> {selectedPilot.email}</div>
                      <div className="flex items-center text-sm text-slate-600 mt-1"><MapPin className="w-4 h-4 mr-2" /> {selectedPilot.location}, {selectedPilot.area}</div>
                      
                      {isProfileIncomplete(selectedPilot) && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                          <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                            ⚠️ Profile is Incomplete
                          </div>
                          <p className="text-xs text-amber-700 mt-1">Some critical application details are missing.</p>
                          <Button
                            size="sm"
                            className="mt-2 text-xs bg-amber-600 hover:bg-amber-700 text-white border-0 h-7"
                            onClick={() => sendProfileReminder(selectedPilot.id)}
                          >
                            <Mail className="w-3 h-3 mr-1" /> Send Completion Reminder Email
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500">Professional Details</h4>
                      <div className="flex flex-col gap-1 mt-2 text-sm bg-slate-50 p-3 rounded-md">
                        <div><span className="font-medium text-slate-700">DGCA No:</span> {selectedPilot.dgca_number || "N/A"}</div>
                        <div><span className="font-medium text-slate-700">Experience:</span> {selectedPilot.experience || "N/A"}</div>
                        <div><span className="font-medium text-slate-700">Specializations:</span> {selectedPilot.specializations || "N/A"}</div>
                        <div><span className="font-medium text-slate-700">Certifications:</span> {selectedPilot.certifications || "N/A"}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500">Personal Verification</h4>
                      <div className="flex flex-col gap-1 mt-2 text-sm bg-slate-50 p-3 rounded-md">
                        {(() => {
                          const details = parseAcademyDetails(selectedPilot.drone_academy)
                          return (
                            <>
                              <div><span className="font-medium text-slate-700">Aadhar No:</span> {details.aadhar}</div>
                              <div><span className="font-medium text-slate-700">PAN Card No:</span> {details.pan}</div>
                              <div><span className="font-medium text-slate-700">Date of Birth:</span> {details.dob}</div>
                              <div><span className="font-medium text-slate-700">Home Address:</span> {details.address}</div>
                              <div><span className="font-medium text-slate-700">Gender:</span> {details.gender}</div>
                              <div><span className="font-medium text-slate-700">Blood Group:</span> {details.blood}</div>
                              <div><span className="font-medium text-slate-700">Emergency Contact:</span> {details.emergency}</div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500">About</h4>
                      <p className="text-sm bg-slate-50 p-3 rounded-md mt-2 whitespace-pre-wrap min-h-[60px]">{selectedPilot.about || "No bio provided."}</p>
                    </div>
                    <div className="flex gap-4">
                      {selectedPilot.profile_image_url && (
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-500 mb-2">Profile Photo</h4>
                          <img src={selectedPilot.profile_image_url} alt="Profile" className="w-full h-32 object-cover rounded-md border" />
                        </div>
                      )}
                      {selectedPilot.certificate_image_url && (
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-500 mb-2">DGCA Certificate</h4>
                          <img src={selectedPilot.certificate_image_url} alt="Certificate" className="w-full h-32 object-cover rounded-md border" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4 space-y-4">
                {showRejectForm ? (
                  <div className="space-y-3 p-3 bg-red-50/50 border border-red-100 rounded-xl">
                    <label className="text-xs font-bold text-red-950 block">
                      REJECTION FEEDBACK (Will be emailed to the pilot explaining the decision)
                    </label>
                    <textarea
                      className="w-full min-h-[90px] p-2.5 bg-white border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      placeholder="E.g., Your remote pilot certificate is illegible. Please submit a high-quality scan."
                      value={rejectFeedback}
                      onChange={(e) => setRejectFeedback(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setShowRejectForm(false); setRejectFeedback(""); }}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold" 
                        size="sm"
                        disabled={!rejectFeedback.trim() || isRejecting} 
                        onClick={() => handleRejectSubmit(selectedPilot!.id)}
                      >
                        {isRejecting ? "Rejecting & Notifying..." : "Confirm Rejection"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <DialogFooter className="flex sm:justify-between">
                    {!selectedPilot?.is_verified ? (
                      <>
                        <Button className="bg-red-600 hover:bg-red-700 text-white font-bold" onClick={() => setShowRejectForm(true)}>
                          <XCircle className="w-4 h-4 mr-2" /> Reject Application
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => approvePilot(selectedPilot!.id)}>
                          <ShieldCheck className="w-4 h-4 mr-2" /> Approve Pilot
                        </Button>
                      </>
                    ) : (
                      <div className="flex w-full justify-between items-center gap-3">
                        <Button className="bg-red-600 hover:bg-red-700 text-white font-bold" onClick={() => setShowRejectForm(true)}>
                          <XCircle className="w-4 h-4 mr-2" /> Revoke Approval
                        </Button>
                        <span className="inline-flex items-center text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2 flex-1 justify-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Active & Verified Profile
                        </span>
                      </div>
                    )}
                  </DialogFooter>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>
    </TableRow>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Pilot Approvals</h1>
          <p className="text-slate-500 mt-1">Review and manage drone pilot registrations.</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="px-4 py-3 bg-blue-50 border-blue-100 flex items-center gap-4 shadow-sm">
            <div className="p-2 bg-blue-100 rounded-lg"><CheckCircle className="w-5 h-5 text-blue-700" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Registered</p>
              <p className="text-2xl font-bold text-blue-900">{pilots.length}</p>
            </div>
          </Card>
          <Card className="px-4 py-3 bg-indigo-50 border-indigo-100 flex items-center gap-4 shadow-sm">
            <div className="p-2 bg-indigo-100 rounded-lg"><Clock className="w-5 h-5 text-indigo-700" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Approval</p>
              <p className="text-2xl font-bold text-indigo-900">{pendingPilots.length}</p>
            </div>
          </Card>
        </div>
      </div>

      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="p-6 bg-white border-b flex justify-between items-center">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search pilots..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50/50 data-[state=active]:text-blue-700 font-medium">
              Needs Approval ({pendingPilots.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50/50 data-[state=active]:text-blue-700 font-medium">
              Approved Pilots ({approvedPilots.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50/50 data-[state=active]:text-blue-700 font-medium">
              Rejected ({rejectedPilots.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="p-0 m-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Email</TableHead>
                  <TableHead className="font-semibold text-slate-600">Location</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : pendingPilots.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No applications pending approval.</TableCell></TableRow>
                ) : (
                  pendingPilots.map(pilot => renderPilotRow(pilot))
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="approved" className="p-0 m-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Email</TableHead>
                  <TableHead className="font-semibold text-slate-600">Location</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : approvedPilots.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No approved pilots found.</TableCell></TableRow>
                ) : (
                  approvedPilots.map(pilot => renderPilotRow(pilot))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="rejected" className="p-0 m-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Email</TableHead>
                  <TableHead className="font-semibold text-slate-600">Rejection Reason</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : rejectedPilots.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No rejected applications found.</TableCell></TableRow>
                ) : (
                  rejectedPilots.map(pilot => renderRejectedRow(pilot))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
