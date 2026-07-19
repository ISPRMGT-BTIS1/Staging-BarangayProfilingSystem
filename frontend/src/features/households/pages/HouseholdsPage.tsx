import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { residents as mockResidents } from '@/mocks'
import HouseholdsView from '@/components/HouseholdsView'

export default function HouseholdsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectId = searchParams.get('select') || null
  
  const [residentsList, setResidentsList] = useState(mockResidents)

  const handleSetSelectedHouseholdId = (val: string | null) => {
    if (val === null) {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('select')
      setSearchParams(newParams, { replace: true })
    }
  }

  return (
    <HouseholdsView
      searchQuery=""
      selectedHouseholdId={selectId}
      setSelectedHouseholdId={handleSetSelectedHouseholdId}
      residentsList={residentsList}
      setResidentsList={setResidentsList}
    />
  )
}
