import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder"

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-08-27.basil",
})

export async function POST(request: NextRequest) {
  try {
    // If no valid Stripe key is configured, return a placeholder response
    if (stripeSecretKey === "sk_test_placeholder") {
      return NextResponse.json({
        error: "Stripe not configured. Please add your STRIPE_SECRET_KEY to .env.local",
        clientSecret: "placeholder_client_secret"
      }, { status: 400 })
    }

    const { amount } = await request.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
