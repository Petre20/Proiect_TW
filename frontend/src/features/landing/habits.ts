import type { ComponentType } from 'react'
import {
  MealIllustration,
  ReadIllustration,
  RideIllustration,
  RunIllustration,
  SleepIllustration,
  StretchIllustration,
} from './illustrations'

export type LandingHabit = { id: string; name: string; meta: string; tint: string; Illustration: ComponentType }

export const habits: LandingHabit[] = [
  { id: 'morning-run', name: 'Morning run', meta: '20 min · 3 times a week', tint: '#FFE4D6', Illustration: RunIllustration },
  { id: 'cook-a-proper-meal', name: 'Cook a proper meal', meta: 'One real meal · every day', tint: '#E3F4CC', Illustration: MealIllustration },
  { id: 'read-10-pages', name: 'Read 10 pages', meta: 'Before bed · every day', tint: '#EEDDFF', Illustration: ReadIllustration },
  { id: 'stretch-and-breathe', name: 'Stretch and breathe', meta: '10 min · every morning', tint: '#D2F3F1', Illustration: StretchIllustration },
  { id: 'weekend-ride', name: 'Weekend ride', meta: 'Any distance · Saturdays', tint: '#DCEBFF', Illustration: RideIllustration },
  { id: 'lights-out-by-2300', name: 'Lights out by 23:00', meta: 'Same time · every night', tint: '#15523D', Illustration: SleepIllustration },
]
