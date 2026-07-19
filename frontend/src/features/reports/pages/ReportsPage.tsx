import React from 'react'
import { residents as mockResidents } from '@/mocks'
import ReportsView from '@/components/ReportsView'

export default function ReportsPage() {
  return <ReportsView residentsList={mockResidents} />
}
