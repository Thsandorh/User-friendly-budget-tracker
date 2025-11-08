"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function InitDbPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleInit = async () => {
    setStatus("loading")
    setMessage("Creating database tables...")

    try {
      const response = await fetch("/api/setup-db", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("success")
        setMessage("✅ Database initialized successfully! All tables created.")
      } else {
        setStatus("error")
        setMessage(`❌ Error: ${data.error || data.details || "Unknown error"}`)
      }
    } catch (error) {
      setStatus("error")
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Failed to initialize database"}`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Database Initialization</h1>
          <p className="mt-2 text-sm text-gray-600">
            Click the button below to create all database tables
          </p>
        </div>

        <Button
          onClick={handleInit}
          disabled={status === "loading" || status === "success"}
          className="w-full"
        >
          {status === "loading" ? "Initializing..." : "Initialize Database"}
        </Button>

        {message && (
          <div
            className={`rounded-md p-4 ${
              status === "success"
                ? "bg-green-50 text-green-800"
                : status === "error"
                ? "bg-red-50 text-red-800"
                : "bg-blue-50 text-blue-800"
            }`}
          >
            <p className="text-sm">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <a
              href="/hu/auth/signup"
              className="text-sm text-blue-600 hover:underline"
            >
              Go to Sign Up →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
