import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ResidentDetailView from '@/components/ResidentDetailView'

export default function ResidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/residents')
  }

  return (
    <ResidentDetailView
      residentId={id || ''}
      onBack={handleBack}
    />
  )
}
