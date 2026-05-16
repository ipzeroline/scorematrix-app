import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EventState {
  registeredEvents: string[];
  eventResults: Record<string, number>;
}

interface EventActions {
  registerForEvent: (eventId: string) => void;
  isRegistered: (eventId: string) => boolean;
  setEventResult: (eventId: string, rank: number) => void;
  getEventResult: (eventId: string) => number | null;
}

export const useEventStore = create<EventState & EventActions>()(
  persist(
    (set, get) => ({
      registeredEvents: [],
      eventResults: {},

      registerForEvent: (eventId) =>
        set((s) => ({
          registeredEvents: s.registeredEvents.includes(eventId)
            ? s.registeredEvents
            : [...s.registeredEvents, eventId],
        })),

      isRegistered: (eventId) => get().registeredEvents.includes(eventId),

      setEventResult: (eventId, rank) =>
        set((s) => ({
          eventResults: { ...s.eventResults, [eventId]: rank },
        })),

      getEventResult: (eventId) => get().eventResults[eventId] ?? null,
    }),
    { name: 'scorematrix-events' }
  )
);
