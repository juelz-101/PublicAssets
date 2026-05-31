export const getGoogleAuthHeaders = (accessToken: string): HeadersInit => {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
};

export const validateGoogleToken = async (accessToken: string): Promise<any> => {
    const url = `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Token validation failed: ${response.statusText}`);
    return await response.json();
};

export const revokeGoogleToken = async (accessToken: string): Promise<void> => {
    const url = `https://oauth2.googleapis.com/revoke?token=${accessToken}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        }
    });
    if (!response.ok) throw new Error(`Token revocation failed: ${response.statusText}`);
};

export const getUserInfo = async (accessToken: string): Promise<any> => {
    const url = `https://www.googleapis.com/oauth2/v2/userinfo`;
    const response = await fetch(url, { headers: getGoogleAuthHeaders(accessToken) });
    if (!response.ok) throw new Error(`User info fetching failed: ${response.statusText}`);
    return await response.json();
};
