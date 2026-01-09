import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Initialize Gemini AI
const apiKey = process.env.GOOGLE_API_KEY || ''
let genAI: GoogleGenerativeAI | null = null
if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey)
}

// System prompt for AeroBot
const SYSTEM_PROMPT = `
ROLE:
You are "AeroBot", the expert AI Assistant for Aerohive Drones (aerohive.co.in).
Your goal is to sell products AND facilitate service bookings.

### 1. PRODUCT SALES
When users ask about drones or products, help them find the right drone for their needs.
Be knowledgeable about drone features, specifications, and use cases.

### 2. SERVICE CATALOG (Bookings)
Use these EXACT categories from the website when users ask for help:

**A. Pilot Services (Hire a Pilot):**
1. Surveying (Land mapping, construction)
2. Spraying (Agricultural crop spraying)
3. 3D Mapping (Topographical data)
4. Inspections (Towers, solar panels, bridges)

**B. Drone Care (Maintenance):**
1. General Checkup
2. Firmware Updates
3. Diagnostic Testing
4. Repair Services

### 3. BOOKING PROTOCOL
If a user wants to book a service or pilot:
1. **Identify Category:** Ask which specific service they need (e.g., "Do you need a pilot for Spraying or Surveying?").
2. **Collect Requirements:** Ask for technical details (acres, hours, problem type).
3. **Collect Location:** Use the "Request Location" tool to get coordinates.
4. **Collect Contact Details:** Ask for their **Full Name** and **WhatsApp/Phone Number**. This is CRITICAL for sending the booking confirmation.
5. **Confirm:** Show the selected pilot and ask for final confirmation.

### BEHAVIORAL RULES
- Keep answers professional and concise.
- Always be helpful and goal-oriented.
- If contact details are missing, politely ask: "May I have your name and phone number to send the booking confirmation?"

Current App State: {state}
User Context: {context}

Analyze the user message and respond with a STRICT JSON object:
1. "intent": ["greet", "list_services", "provide_requirements", "provide_location", "select_radius", "select_pilot", "select_slot", "provide_contact", "confirm_booking", "unknown"]
2. "category": ["Surveying", "Spraying", "3D Mapping", "Inspections", "General Checkup", "Firmware Updates", "Diagnostic Testing", "Repair Services"]
3. "radius_km": [10, 20, 50]
4. "requirements": JSON object with specific details (e.g., acres, hours, problem type).
5. "location_name": Extracted city/area.
6. "user_name": Extracted user full name.
7. "user_phone": Extracted user phone number.
8. "response_text": Professional, concise response.
9. "next_state": [INIT, REQUIREMENTS, LOCATION, RADIUS, RESULTS, SLOT, CONTACT, PAYMENT, CONFIRM, SUCCESS]
10. "action": ["request_location", "show_results", "request_radius", "process_booking", "typing", "null"]

CRITICAL: Never expose internal technical details. Be efficient and professional.
`

// Generate booking ID
function generateBookingId(service: string): string {
    const num = Math.floor(1000 + Math.random() * 9000)
    return `#AH-${num}`
}

// Search pilots from database
async function searchPilots(lat: number, lng: number, radiusKm: number, category?: string) {
    if (!supabase) {
        console.log('DEBUG: Supabase not connected, returning empty pilot list')
        return []
    }

    try {
        console.log(`DEBUG: Searching pilots - lat: ${lat}, lng: ${lng}, radius: ${radiusKm}km, category: ${category}`)

        let query = supabase
            .from('drone_pilots')
            .select('*')
            .eq('is_verified', true)
            .eq('is_active', true)

        if (category) {
            query = query.ilike('specializations', `%${category}%`)
        }

        query = query.order('rating', { ascending: false }).limit(3)

        const { data, error } = await query

        if (error) {
            console.error('SEARCH ERROR:', error)
            return []
        }

        const pilots = data || []
        console.log(`DEBUG: Found ${pilots.length} pilots from database`)

        return pilots.map((pilot: any) => ({
            id: pilot.id,
            full_name: pilot.full_name,
            specialization: pilot.specializations,
            hourly_rate: pilot.hourly_rate,
            rating: parseFloat(pilot.rating || 0),
            location: pilot.location,
            area: pilot.area,
            experience: pilot.experience,
            completed_jobs: pilot.completed_jobs || 0,
            latitude: pilot.latitude,
            longitude: pilot.longitude
        }))
    } catch (error) {
        console.error('SEARCH ERROR:', error)
        return []
    }
}

// Demo mode responses
function getDemoResponse(message: string, state: string, context: any) {
    const msg = message.toLowerCase()

    let response = {
        intent: "unknown",
        next_state: state,
        response_text: "I'm AeroBot, your Aerohive assistant. How can I help you today?",
        action: null as string | null,
        data: null as any
    }

    if (state === "INIT" || msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
        response = {
            intent: "greet",
            response_text: "Hello! I'm AeroBot, your Aerohive assistant. I can help you with:\n\n**Pilot Services:** Surveying, Spraying, 3D Mapping, Inspections\n**Drone Care:** General Checkup, Firmware Updates, Diagnostic Testing, Repair Services\n\nWhat can I assist you with today?",
            next_state: "REQUIREMENTS",
            action: null,
            data: null
        }
    } else if (msg.includes("service") || msg.includes("what do you") || msg.includes("what can")) {
        response = {
            intent: "list_services",
            response_text: "We offer:\n\n**Pilot Services (Hire a Pilot):**\n• Surveying - Land mapping, construction\n• Spraying - Agricultural crop spraying\n• 3D Mapping - Topographical data\n• Inspections - Towers, solar panels, bridges\n\n**Drone Care (Maintenance):**\n• General Checkup\n• Firmware Updates\n• Diagnostic Testing\n• Repair Services\n\nWhich service interests you?",
            next_state: "REQUIREMENTS",
            action: null,
            data: null
        }
    } else if (state === "REQUIREMENTS" || ["survey", "spray", "mapping", "3d", "inspect", "checkup", "firmware", "diagnostic", "repair"].some(x => msg.includes(x))) {
        const category = msg.includes("survey") ? "Surveying" :
            msg.includes("spray") ? "Spraying" :
                (msg.includes("mapping") || msg.includes("3d")) ? "3D Mapping" :
                    msg.includes("inspect") ? "Inspections" :
                        msg.includes("checkup") ? "General Checkup" :
                            msg.includes("firmware") ? "Firmware Updates" :
                                msg.includes("diagnostic") ? "Diagnostic Testing" : "Repair Services"
        response = {
            intent: "provide_requirements",
            response_text: `Great choice! For ${category}, I'll need a few details. Could you please share your location?`,
            next_state: "LOCATION",
            action: "request_location",
            data: { category }
        }
    } else if (state === "LOCATION" || msg.includes("location shared")) {
        response = {
            intent: "provide_location",
            response_text: "Location captured! What search radius should I use to find professionals near you?",
            next_state: "RADIUS",
            action: "request_radius",
            data: null
        }
    } else if (state === "RADIUS" || msg.includes("km")) {
        const radius = msg.includes("10") ? 10 : msg.includes("20") ? 20 : 50
        response = {
            intent: "select_radius",
            response_text: "Searching for professionals near you...",
            next_state: "RESULTS",
            action: "show_results",
            data: { radius_km: radius }
        }
    } else if (state === "RESULTS" && msg.includes("select")) {
        response = {
            intent: "provide_contact",
            response_text: "Excellent. To finalize the booking and send your confirmation, please provide your **Full Name** and **Phone Number**.",
            next_state: "CONTACT",
            action: null,
            data: null
        }
    } else if (state === "CONTACT") {
        response = {
            intent: "confirm_booking",
            response_text: "Thank you! Everything is ready. Shall I proceed with the booking?",
            next_state: "CONFIRM",
            action: null,
            data: null
        }
    } else if (state === "CONFIRM" || msg.includes("confirm") || msg.includes("book")) {
        response = {
            intent: "confirm_booking",
            response_text: "",
            next_state: "SUCCESS",
            action: "process_booking",
            data: null
        }
    }

    return response
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { message, state, context } = body

        let aiResponse: any
        let useDemo = !genAI

        // Try AI response first
        if (!useDemo) {
            try {
                const model = genAI!.getGenerativeModel({ model: 'gemini-1.5-flash' })
                const prompt = SYSTEM_PROMPT
                    .replace('{state}', state)
                    .replace('{context}', JSON.stringify(context || {}))

                const result = await model.generateContent([
                    { text: prompt },
                    { text: `User Message: ${message}\n\nReturn JSON ONLY.` }
                ])

                let text = result.response.text().trim()

                // Extract JSON from markdown code blocks if present
                if (text.includes('```json')) {
                    text = text.split('```json')[1].split('```')[0].trim()
                } else if (text.includes('```')) {
                    text = text.split('```')[1].split('```')[0].trim()
                }

                aiResponse = JSON.parse(text)
                console.log('DEBUG PRODUCTION AI:', aiResponse)
            } catch (error) {
                console.error('AI ERROR, falling back to demo:', error)
                useDemo = true
            }
        }

        // Demo mode fallback
        if (useDemo) {
            aiResponse = getDemoResponse(message, state, context)
            console.log('DEBUG DEMO MODE:', aiResponse)
        }

        // Handle actions
        const intent = aiResponse.intent

        // Search pilots when showing results
        if (aiResponse.action === 'show_results' || intent === 'select_radius') {
            const lat = context?.lat
            const lng = context?.lng
            const radius = aiResponse.radius_km || context?.radius_km || 20
            const category = aiResponse.category || context?.category

            if (lat && lng) {
                const pilots = await searchPilots(lat, lng, radius, category)
                return NextResponse.json({
                    message: pilots.length > 0
                        ? `I've searched within a ${radius}km radius. I found ${pilots.length} qualified pilots for your mission.`
                        : `I couldn't find any pilots within ${radius}km. Please try a larger radius or search from a different area.`,
                    next_state: "RESULTS",
                    action: "show_results",
                    data: { pilots, radius_km: radius }
                })
            } else {
                return NextResponse.json({
                    message: "I need your location to find nearby pilots. Please use the button below.",
                    next_state: "LOCATION",
                    action: "request_location"
                })
            }
        }

        // Handle booking confirmation
        if (aiResponse.action === 'process_booking' || intent === 'confirm_booking') {
            const bookingId = generateBookingId(aiResponse.category || context?.category || '')
            return NextResponse.json({
                message: `Mission Confirmed! Your tracking ID is ${bookingId}. Our team will contact you shortly.`,
                next_state: "SUCCESS",
                action: "booking_complete",
                data: { booking_id: bookingId }
            })
        }

        // Default response
        return NextResponse.json({
            message: aiResponse.response_text || "Understood. Proceeding...",
            next_state: aiResponse.next_state || state,
            action: aiResponse.action || null,
            data: aiResponse.data || null
        })

    } catch (error) {
        console.error('Chat API Error:', error)
        return NextResponse.json(
            { message: "I encountered an error. Please try again.", next_state: "INIT" },
            { status: 500 }
        )
    }
}
