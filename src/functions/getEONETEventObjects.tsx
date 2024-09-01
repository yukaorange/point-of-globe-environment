import { EONETEvent } from '@/functions/fetchEONETEvent'
import { EventCategory } from '@/state/phenomenon'
import { PhenomenonState } from '@/state/phenomenon'
export const getEONETEventObjects = (
  events: Record<EventCategory, EONETEvent>,
) => {
  const eventObjects: PhenomenonState['titles'] = {
    earthquakes: {},
    volcanoes: {},
    floods: {},
    wildfires: {},
  }

  Object.entries(events).forEach(([category, eventData]) => {
    eventObjects[category as EventCategory] = eventData.events.map((event) => {
      const objectSet = {
        title: event.title,
        description: event.description,
        closed: event.closed,
      }

      return objectSet
    })
  })

  return eventObjects
}
