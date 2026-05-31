import { getGoogleAuthHeaders } from './google-auth';

export const getGoogleProfile = async (accessToken: string, personFields: string = 'names,emailAddresses,photos'): Promise<any> => {
  const url = `https://people.googleapis.com/v1/people/me?personFields=${personFields}`;
  const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
  if (!response.ok) throw new Error(`People get profile error: ${response.statusText}`);
  return await response.json();
};

export const getGoogleContact = async (accessToken: string, resourceName: string, personFields: string = 'names,emailAddresses,phoneNumbers'): Promise<any> => {
    const url = `https://people.googleapis.com/v1/${resourceName}?personFields=${personFields}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`People get contact error: ${response.statusText}`);
    return await response.json();
};

export const listGoogleContacts = async (accessToken: string, maxResults: number = 100, personFields: string = 'names,emailAddresses,phoneNumbers'): Promise<any[]> => {
    const url = `https://people.googleapis.com/v1/people/me/connections?pageSize=${maxResults}&personFields=${personFields}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`People list contacts error: ${response.statusText}`);
    const data = await response.json();
    return data.connections || [];
};

export const createGoogleContact = async (accessToken: string, contact: any): Promise<any> => {
    const url = `https://people.googleapis.com/v1/people:createContact`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify(contact)
    });
    if (!response.ok) throw new Error(`People create contact error: ${response.statusText}`);
    return await response.json();
};

export const updateGoogleContact = async (accessToken: string, resourceName: string, contact: any, updatePersonFields: string): Promise<any> => {
    const url = `https://people.googleapis.com/v1/${resourceName}:updateContact?updatePersonFields=${updatePersonFields}`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify(contact)
    });
    if (!response.ok) throw new Error(`People update contact error: ${response.statusText}`);
    return await response.json();
};

export const deleteGoogleContact = async (accessToken: string, resourceName: string): Promise<void> => {
    const url = `https://people.googleapis.com/v1/${resourceName}:deleteContact`;
    const response = await fetch(url, { method: 'DELETE', headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`People delete contact error: ${response.statusText}`);
};

export const searchGoogleContacts = async (accessToken: string, query: string, readMask: string = 'names,emailAddresses,phoneNumbers', pageSize: number = 30): Promise<any[]> => {
    const url = `https://people.googleapis.com/v1/people:searchContacts?query=${encodeURIComponent(query)}&readMask=${readMask}&pageSize=${pageSize}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`People search contacts error: ${response.statusText}`);
    const data = await response.json();
    return data.results || [];
};

export const listGoogleContactGroups = async (accessToken: string, pageSize: number = 50): Promise<any[]> => {
    const url = `https://people.googleapis.com/v1/contactGroups?pageSize=${pageSize}`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`People list contact groups error: ${response.statusText}`);
    const data = await response.json();
    return data.contactGroups || [];
};

export const createGoogleContactGroup = async (accessToken: string, name: string): Promise<any> => {
    const url = `https://people.googleapis.com/v1/contactGroups`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getGoogleAuthHeaders(accessToken),
        body: JSON.stringify({ contactGroup: { name } })
    });
    if (!response.ok) throw new Error(`People create contact group error: ${response.statusText}`);
    return await response.json();
};
