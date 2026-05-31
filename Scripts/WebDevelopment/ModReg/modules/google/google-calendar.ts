import { getGoogleAuthHeaders } from './google-auth';

export interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; timeZone?: string; date?: string };
  end?: { dateTime?: string; timeZone?: string; date?: string };
  attendees?: Array<{ email: string }>;
  location?: string;
}

export const listGoogleCalendarEvents = async (accessToken: string, calendarId: string = 'primary', maxResults: number = 10, timeMin?: string, timeMax?: string): Promise<GoogleCalendarEvent[]> => {
  let url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?maxResults=${maxResults}&orderBy=startTime&singleEvents=true`;
  if (timeMin) url += `&timeMin=${encodeURIComponent(timeMin)}`;
  if (timeMax) url += `&timeMax=${encodeURIComponent(timeMax)}`;
  
  const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
  if (!response.ok) throw new Error(`Calendar list error: ${response.statusText}`);
  const data = await response.json();
  return data.items || [];
};

export const getGoogleCalendarEvent = async (accessToken: string, calendarId: string, eventId: string): Promise<GoogleCalendarEvent> => {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
  const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
  if (!response.ok) throw new Error(`Calendar get event error: ${response.statusText}`);
  return await response.json();
};

export const createGoogleCalendarEvent = async (accessToken: string, calendarId: string = 'primary', event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> => {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  const response = await fetch(url, {
      method: 'POST',
      headers: getGoogleAuthHeaders(accessToken),
      body: JSON.stringify(event)
  });
  if (!response.ok) throw new Error(`Calendar create error: ${response.statusText}`);
  return await response.json();
};

export const updateGoogleCalendarEvent = async (accessToken: string, calendarId: string, eventId: string, event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> => {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
  const response = await fetch(url, {
      method: 'PUT',
      headers: getGoogleAuthHeaders(accessToken),
      body: JSON.stringify(event)
  });
  if (!response.ok) throw new Error(`Calendar update error: ${response.statusText}`);
  return await response.json();
};

export const deleteGoogleCalendarEvent = async (accessToken: string, calendarId: string = 'primary', eventId: string): Promise<void> => {
   const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
   const response = await fetch(url, { method: 'DELETE', headers: getGoogleAuthHeaders(accessToken) });
   if (!response.ok) throw new Error(`Calendar delete error: ${response.statusText}`);
};

export const listGoogleCalendars = async (accessToken: string): Promise<any[]> => {
    const url = `https://www.googleapis.com/calendar/v3/users/me/calendarList`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`Calendar list calendars error: ${response.statusText}`);
    const data = await response.json();
    return data.items || [];
};

export const createGoogleCalendar = async (accessToken: string, summary: string, timeZone?: string): Promise<any> => {
    const url = `https://www.googleapis.com/calendar/v3/calendars`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify({ summary, timeZone })
    });
    if (!response.ok) throw new Error(`Calendar create calendar error: ${response.statusText}`);
    return await response.json();
};

export const quickAddGoogleCalendarEvent = async (accessToken: string, calendarId: string, text: string): Promise<GoogleCalendarEvent> => {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/quickAdd?text=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken)
    });
    if (!response.ok) throw new Error(`Calendar quick add error: ${response.statusText}`);
    return await response.json();
};
