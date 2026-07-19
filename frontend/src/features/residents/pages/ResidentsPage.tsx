import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { residents as mockResidents } from '@/mocks'
import ResidentsView from '@/components/ResidentsView'

export default function ResidentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const q = searchParams.get('q') || ''
  const isNew = searchParams.get('new') === 'true'
  
  const [showNewProfilingModal, setShowNewProfilingModal] = useState(false)
  const [residentsList, setResidentsList] = useState(mockResidents)

  // Sync the `new` search parameter with modal state
  useEffect(() => {
    if (isNew) {
      setShowNewProfilingModal(true)
      // Clear the query parameter so it doesn't reopen on reload
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('new')
      setSearchParams(newParams, { replace: true })
    }
  }, [isNew, searchParams, setSearchParams])

  const handleHouseholdLink = (householdId: string) => {
    navigate(`/households?select=${householdId}`)
  }

  const handleViewResident = (residentId: string) => {
    navigate(`/residents/${residentId}`)
  }

  return (
    <ResidentsView
      searchQuery={q}
      showNewProfilingModal={showNewProfilingModal}
      setShowNewProfilingModal={setShowNewProfilingModal}
      activeTab="residents"
      setActiveTab={() => {}}
      setSelectedHouseholdId={handleHouseholdLink}
      residentsList={residentsList}
      setResidentsList={setResidentsList}
      onViewResident={handleViewResident}
    />
  )
}
