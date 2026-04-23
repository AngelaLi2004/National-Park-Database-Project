const BASE_URL = 'http://localhost:3007/api';

export const searchSpeciesDB = async (name, searchType, category, park, order) => {
  try {
    const params = new URLSearchParams();
    params.append('name', name);
    params.append('searchType', searchType);
    params.append('order', order.toLowerCase());

    if (category && category !== 'ALL') params.append('category', category);
    if (park && park !== 'ALL') params.append('park', park);

    const response = await fetch(`${BASE_URL}/species/search?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch species");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const searchByParkDB = async (park, category, order) => {
  try {
    const params = new URLSearchParams();
    params.append('park', park);
    params.append('order', order.toLowerCase());

    if (category && category !== 'ALL') params.append('category', category);

    const response = await fetch(`${BASE_URL}/species/by-park?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch park species");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const searchLocationsDB = async (name, parkCode) => {
  try {
    const params = new URLSearchParams();
    params.append('name', name);

    if (parkCode) {
      params.append('parkCode', parkCode);
    }

    const response = await fetch(`${BASE_URL}/locations/search?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch locations");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// SIGHTINGS ROUTES
export const getUserSightings = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/sightings/user/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user sightings");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const addSightingDB = async (sightingData) => {
  try {
    const response = await fetch(`${BASE_URL}/sightings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sightingData),
    });
    if (!response.ok) throw new Error("Failed to add sighting");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteSightingDB = async (sightingId) => {
  try {
    const response = await fetch(`${BASE_URL}/sightings/${sightingId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error("Failed to delete sighting");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const updateSightingDB = async (sightingId, updatedData) => {
  try {
    const response = await fetch(`${BASE_URL}/sightings/${sightingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error("Failed to update sighting");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// login
export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Login failed");
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const signupUser = async (username, password) => {
  try {
    const response = await fetch(`${BASE_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Signup failed");
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};