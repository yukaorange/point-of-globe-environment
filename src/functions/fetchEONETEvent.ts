import { EventCategory } from '@/state/phenomenon'

const EONET_API_BASE_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events'
const EONET_API_BASE_CATEGRY = 'https://eonet.gsfc.nasa.gov/api/v3/categories'

export interface EONETEvent {
  title: string
  category: string
  events: {
    title: string
    geometry: {
      type: string
      coordinates: number[]
    }[]
    description: string
    closed: string
  }[]
}

const fetchEONETEvent = async (category: EventCategory) => {
  try {
    const response = await fetch(
      `${EONET_API_BASE_URL}?category=${category}&status=closed&limit=10`,
    )

    // const response_test = await fetch(`${EONET_API_BASE_CATEGRY}`)
    // const data_test = await response_test.json()
    // console.log(data_test)

    if (!response.ok) {
      throw new Error('Failed to fetch EONET event')
    }

    const data = await response.json()

    return data
  } catch (err) {
    console.error('Error fetching EONET event : ', err)
  }
}

export { fetchEONETEvent }
