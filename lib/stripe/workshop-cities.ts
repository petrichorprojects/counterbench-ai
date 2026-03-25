/**
 * Workshop event configuration.
 * Online-first model — in-person events added later as premium upsell.
 */

export type CityKey = "online";

export interface WorkshopEvent {
  key: CityKey;
  name: string;
  date: string;
  venue: string;
  capacity: number;
}

export const WORKSHOP_CITIES: Record<CityKey, WorkshopEvent> = {
  online: {
    key: "online",
    name: "Live Online",
    date: "Saturday, April 25, 2026",
    venue: "Zoom — link sent after registration",
    capacity: 25,
  },
};
