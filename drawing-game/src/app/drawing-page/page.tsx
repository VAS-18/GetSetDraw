import React from 'react'
import DrawingCanvas from '@/app/components/DrawingCanvas'

export default function DrawingPage() {
  return (
    <div className="container mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold mb-4">Drawing Page</h1>
      </div>
      <DrawingCanvas />
    </div>
  )
}
