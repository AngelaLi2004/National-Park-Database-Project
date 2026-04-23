import { Species } from "../models/species";
import { User } from '../models/user';
import { Sighting } from "../models/sighting";
import pool from './connection';
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { fetchImageByScientificName } from "./image";
// login
export async function getUserByUsername(username: string): Promise<User | null> {
  const query = `SELECT * FROM Users WHERE Username = ?`;
  const [rows] = await pool.query(query, [username]);
  const users = rows as User[];
  return users.length > 0 ? users[0] : null; 
}

// signup
export async function createUser(username: string, hashedPassword: string): Promise<number> {
  const query = `INSERT INTO Users (Username, Password) VALUES (?, ?)`;
  const [result] = await pool.execute(query, [username, hashedPassword]);
  return (result as any).insertId;
}

// Species
export async function searchSpecies(
  name: string,
  searchType: 'common' | 'scientific',
  category: string | undefined,
  park: string | undefined,
  order: 'asc' | 'desc'
): Promise<Species[]> {
  let sqlQuery = `
    SELECT DISTINCT s.*
    FROM national_park_species_database.Species s
  `;

  const conditions: string[] = [];
  const queryParams: any[] = [];

  if (park) {
    sqlQuery += `
      JOIN national_park_species_database.ParkSpecies ps ON s.SpeciesId = ps.SpeciesId
      JOIN national_park_species_database.NationalParks p ON ps.ParkCode = p.ParkCode
    `;
    conditions.push(`LOWER(p.ParkName) LIKE CONCAT('%', ?, '%')`);
    queryParams.push(park.toLowerCase());
  }

  if (searchType === 'common') {
    conditions.push(`LOWER(s.CommonName) LIKE CONCAT('%', ?, '%')`);
    queryParams.push(name.toLowerCase());
  } else {
    conditions.push(`LOWER(s.ScientificName) LIKE CONCAT('%', ?, '%')`);
    queryParams.push(name.toLowerCase());
  }

  if (category) {
    conditions.push(`LOWER(s.Category) = ?`);
    queryParams.push(category.toLowerCase());
  }

  if (conditions.length > 0) {
    sqlQuery += ` WHERE ` + conditions.join(' AND ');
  }

  const orderByField = searchType === 'common' ? 'CommonName' : 'ScientificName';
  const orderDirection = order === 'desc' ? 'DESC' : 'ASC';
  
  sqlQuery += ` ORDER BY s.${orderByField} ${orderDirection}`;
  sqlQuery += ` LIMIT 200;`;

  const [rows] = await pool.query<RowDataPacket[]>(sqlQuery, queryParams);
  return rows as Species[];
}

export async function enrichSpeciesWithImages(speciesList: Species[]) {
  return Promise.all(
    speciesList.map(async (s) => {
      if (s.Image) return s;

      const image = await fetchImageByScientificName(
        s.ScientificName
      );

      if (image) {
        await pool.query(
          "UPDATE Species SET Image = ? WHERE SpeciesID = ?",
          [image, s.SpeciesID]
        );
      }

      return {
        ...s,
        Image: image,
      };
    })
  );
}

export async function getSpeciesByPark(
  park: string,
  category: string | undefined,
  order: 'asc' | 'desc'
): Promise<Species[]> {
  const orderDirection = order === 'desc' ? 'DESC' : 'ASC';

  let sqlQuery = `
    SELECT s.* 
    FROM national_park_species_database.Species s
    JOIN national_park_species_database.ParkSpecies ps ON s.SpeciesId = ps.SpeciesId
    JOIN national_park_species_database.NationalParks p ON ps.ParkCode = p.ParkCode
    WHERE LOWER(p.ParkName) LIKE CONCAT('%', ?, '%')
  `;

  const queryParams: any[] = [park.toLowerCase()];

  if (category) {
    sqlQuery += ` AND LOWER(s.Category) = ?`;
    queryParams.push(category.toLowerCase());
  }

  sqlQuery += ` ORDER BY s.CommonName ${orderDirection} LIMIT 200;`;
  
  const [rows] = await pool.query<RowDataPacket[]>(sqlQuery, queryParams);
  return rows as Species[];
}

export async function getParksBySpeciesId(speciesId: number) {
  const sqlQuery = `
    SELECT DISTINCT
      p.ParkCode,
      p.ParkName,
      p.State,
      p.Image,
      p.Description
    FROM national_park_species_database.NationalParks p
    JOIN national_park_species_database.ParkSpecies ps
      ON p.ParkCode = ps.ParkCode
    WHERE ps.SpeciesID = ?
    ORDER BY p.ParkName ASC
  `;

  const [rows] = await pool.query<RowDataPacket[]>(sqlQuery, [speciesId]);
  return rows;
}

// Sightings
export async function getSightingsBySpeciesAndPark(
  speciesId: number,
  parkCode?: string
): Promise<Sighting[]> {
  let sqlQuery = `
    SELECT s.*
    FROM national_park_species_database.Sightings s
    JOIN national_park_species_database.Locations l 
      ON s.LocationID = l.LocationID
    WHERE s.SpeciesID = ?
  `;

  const params: any[] = [speciesId];

  if (parkCode) {
    sqlQuery += ` AND l.ParkCode = ?`;
    params.push(parkCode);
  }

  sqlQuery += ` ORDER BY s.SightingDate DESC`;

  const [rows] = await pool.query<RowDataPacket[]>(sqlQuery, params);
  return rows as Sighting[];
}

export async function addSighting(sighting: Sighting): Promise<Sighting> {
  const sql = `
    INSERT INTO national_park_species_database.Sightings
      (UserID, LocationID, SpeciesID, SightingDate, ImageURL, Description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query<ResultSetHeader>(sql, [
    sighting.UserID,
    sighting.LocationID,
    sighting.SpeciesID,
    sighting.SightingDate,
    sighting.ImageURL || null,
    sighting.Description || null,
  ]);

  return { ...sighting, SightingID: result.insertId };
}

export async function deleteSighting(sightingId: number): Promise<void> {
  await pool.query(
    `DELETE FROM national_park_species_database.Sightings WHERE SightingID = ?`,
    [sightingId]
  );
}

export async function updateSighting(sighting: Sighting): Promise<void> {
  const sql = `
    UPDATE national_park_species_database.Sightings
    SET UserID = ?, LocationID = ?, SpeciesID = ?, SightingDate = ?, ImageURL = ?, Description = ?
    WHERE SightingID = ?
  `;

  await pool.query<ResultSetHeader>(sql, [
    sighting.UserID,
    sighting.LocationID,
    sighting.SpeciesID,
    sighting.SightingDate,
    sighting.ImageURL || null,
    sighting.Description || null,
    sighting.SightingID
  ]);
}

export async function getSightingsByUser(userId: number) {
  const sql = `
    SELECT 
      s.SightingID,
      s.UserID,
      s.LocationID,
      s.SpeciesID,
      s.SightingDate,
      s.ImageURL,
      s.Description,
      sp.CommonName AS SpeciesName,
      l.Name AS LocationName,
      l.Type AS LocationType,
      l.ParkCode
    FROM national_park_species_database.Sightings s
    JOIN national_park_species_database.Species sp
      ON s.SpeciesID = sp.SpeciesID
    JOIN national_park_species_database.Locations l
      ON s.LocationID = l.LocationID
    WHERE s.UserID = ?
    ORDER BY s.SightingDate DESC
  `;
  const [rows] = await pool.query<RowDataPacket[]>(sql, [userId]);
  return rows;
}

export async function searchLocations(
  name: string,
  parkCode?: string
) {
  let sqlQuery = `
    SELECT LocationID, ParkCode, Name, Type, Geometry
    FROM national_park_species_database.Locations
    WHERE LOWER(Name) LIKE CONCAT('%', ?, '%')
  `;

  const queryParams: any[] = [name.toLowerCase()];

  if (parkCode) {
    sqlQuery += ` AND ParkCode = ?`;
    queryParams.push(parkCode);
  }

  sqlQuery += ` ORDER BY Name ASC LIMIT 100;`;

  const [rows] = await pool.query<RowDataPacket[]>(sqlQuery, queryParams);
  return rows;
}

// Detail page: species stats filtered by park
export async function getSpeciesDetailByPark(
  speciesId: number,
  parkCode: string
) {
  // Query 1: Most Recent Sighting + Last Observed Location
  const recentSightingSQL = `
    SELECT 
      s.SightingDate,
      l.Name AS LocationName,
      np.ParkName
    FROM national_park_species_database.Sightings s
    JOIN national_park_species_database.Locations l ON s.LocationID = l.LocationID
    JOIN national_park_species_database.NationalParks np ON l.ParkCode = np.ParkCode
    WHERE s.SpeciesID = ? AND l.ParkCode = ?
    ORDER BY s.SightingDate DESC
    LIMIT 1;
  `;

  // Query 2: Best Time of Year (sighting count grouped by month)
  const monthlySQL = `
    SELECT 
      MONTH(s.SightingDate) AS Month,
      COUNT(*) AS SightingCount
    FROM national_park_species_database.Sightings s
    JOIN national_park_species_database.Locations l ON s.LocationID = l.LocationID
    WHERE s.SpeciesID = ? AND l.ParkCode = ?
    GROUP BY MONTH(s.SightingDate)
    ORDER BY Month;
  `;

  // Query 3: Time of Day (sighting count grouped by hour)
  const hourlySQL = `
    SELECT 
      HOUR(s.SightingDate) AS Hour,
      COUNT(*) AS SightingCount
    FROM national_park_species_database.Sightings s
    JOIN national_park_species_database.Locations l ON s.LocationID = l.LocationID
    WHERE s.SpeciesID = ? AND l.ParkCode = ?
    GROUP BY HOUR(s.SightingDate)
    ORDER BY Hour;
  `;

  // Query 4: Park geometry (for the map)
  // Park image
  const parkInfoSQL = `
    SELECT Image
    FROM national_park_species_database.NationalParks
    WHERE ParkCode = ?;
  `;

  // Sighting pins: distinct locations with extracted lat/lng
  const pinsSQL = `
    SELECT DISTINCT
      l.LocationID,
      l.Name AS LocationName,
      CAST(JSON_EXTRACT(l.Geometry, '$.coordinates[0]') AS DECIMAL(10,6)) AS Longitude,
      CAST(JSON_EXTRACT(l.Geometry, '$.coordinates[1]') AS DECIMAL(10,6)) AS Latitude,
      COUNT(s.SightingID) AS SightingCount
    FROM national_park_species_database.Sightings s
    JOIN national_park_species_database.Locations l ON s.LocationID = l.LocationID
    WHERE s.SpeciesID = ? AND l.ParkCode = ?
    GROUP BY l.LocationID, l.Name, l.Geometry;
  `;

  const [recentRows] = await pool.query<RowDataPacket[]>(recentSightingSQL, [speciesId, parkCode]);
  const [monthlyRows] = await pool.query<RowDataPacket[]>(monthlySQL, [speciesId, parkCode]);
  const [hourlyRows] = await pool.query<RowDataPacket[]>(hourlySQL, [speciesId, parkCode]);
  const [parkRows] = await pool.query<RowDataPacket[]>(parkInfoSQL, [parkCode]);
  const [pinsRows] = await pool.query<RowDataPacket[]>(pinsSQL, [speciesId, parkCode]);

  return {
    mostRecentSighting: recentRows[0] || null,       // SightingDate, LocationName, ParkName
    monthlyDistribution: monthlyRows,                 // [{Month: 1, SightingCount: 3}, ...]
    hourlyDistribution: hourlyRows,                   // [{Hour: 14, SightingCount: 5}, ...]
    parkInfo: parkRows[0] || null,                    // Geometry, Image
    sightingPins: pinsRows,
  };
}