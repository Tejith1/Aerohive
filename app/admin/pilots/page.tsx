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

  const approvePilot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('drone_pilots')
        .update({ is_verified: true, is_active: true })
        .eq('id', id)

      if (error) throw error
      
      toast({
        title: "Approved",
        description: "Pilot has been successfully verified.",
        className: "bg-green-50 text-green-900 border-green-200"
      })
      
      setPilots(pilots.map(p => p.id === id ? { ...p, is_verified: true, is_active: true } : p))
      setSelectedPilot(null)
    } catch (error) {
      console.error('Error approving pilot:', error)
      toast({ title: "Error", description: "Failed to approve pilot", variant: "destructive" })
    }
  }

  const rejectPilot = async (id: string) => {
    try {
      // For now, we just delete them or set them inactive
      const { error } = await supabase
        .from('drone_pilots')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast({
        title: "Rejected",
        description: "Pilot application has been rejected and removed."
      })
      
      setPilots(pilots.filter(p => p.id !== id))
      setSelectedPilot(null)
    } catch (error) {
      console.error('Error rejecting pilot:', error)
      toast({ title: "Error", description: "Failed to reject pilot", variant: "destructive" })
    }
  }

  const filteredPilots = pilots.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingPilots = filteredPilots.filter(p => !p.is_verified)
  const approvedPilots = filteredPilots.filter(p => p.is_verified)

  const PilotRow = ({ pilot }: { pilot: DronePilot }) => (
    <TableRow key={pilot.id}>
      <TableCell className="font-medium">{pilot.full_name}</TableCell>
      <TableCell>{pilot.email}</TableCell>
      <TableCell>{pilot.location} - {pilot.area}</TableCell>
      <TableCell>
        <Badge variant={pilot.is_verified ? "default" : "secondary"} className={pilot.is_verified ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-blue-100 text-blue-800 hover:bg-blue-200"}>
          {pilot.is_verified ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
          {pilot.is_verified ? "Approved" : "Pending"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setSelectedPilot(pilot)}>
              Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pilot Application Details</DialogTitle>
              <DialogDescription>Review the details provided by the pilot during registration.</DialogDescription>
            </DialogHeader>
            {selectedPilot && (
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500">Personal Info</h4>
                    <p className="text-lg font-medium">{selectedPilot.full_name}</p>
                    <div className="flex items-center text-sm text-slate-600 mt-1"><Mail className="w-4 h-4 mr-2" /> {selectedPilot.email}</div>
                    <div className="flex items-center text-sm text-slate-600"><MapPin className="w-4 h-4 mr-2" /> {selectedPilot.location}, {selectedPilot.area}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500">Professional Details</h4>
                    <div className="flex flex-col gap-1 mt-1 text-sm bg-slate-50 p-3 rounded-md">
                      <div><span className="font-medium">DGCA No:</span> {selectedPilot.dgca_number || "N/A"}</div>
                      <div><span className="font-medium">Experience:</span> {selectedPilot.experience}</div>
                      <div><span className="font-medium">Specializations:</span> {selectedPilot.specializations}</div>
                      <div><span className="font-medium">Certifications:</span> {selectedPilot.certifications}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500">About</h4>
                    <p className="text-sm bg-slate-50 p-3 rounded-md mt-1 whitespace-pre-wrap">{selectedPilot.about || "No bio provided."}</p>
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
            <DialogFooter className="flex sm:justify-between border-t pt-4">
              {!selectedPilot?.is_verified ? (
                <>
                  <Button variant="destructive" onClick={() => rejectPilot(selectedPilot!.id)}>
                    <XCircle className="w-4 h-4 mr-2" /> Reject Application
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => approvePilot(selectedPilot!.id)}>
                    <ShieldCheck className="w-4 h-4 mr-2" /> Approve Pilot
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  <CheckCircle className="w-4 h-4 mr-2" /> Already Approved
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                  pendingPilots.map(pilot => <PilotRow key={pilot.id} pilot={pilot} />)
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
                  approvedPilots.map(pilot => <PilotRow key={pilot.id} pilot={pilot} />)
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
