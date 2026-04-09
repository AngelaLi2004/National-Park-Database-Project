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
  sqlQuery += ` LIMIT 50;`;

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

  sqlQuery += ` ORDER BY s.CommonName ${orderDirection} LIMIT 50;`;
  
  const [rows] = await pool.query<RowDataPacket[]>(sqlQuery, queryParams);
  return rows as Species[];
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

export async function getSightingsByUser(userId: number): Promise<Sighting[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM national_park_species_database.Sightings 
    WHERE UserID = ? 
    ORDER BY SightingDate DESC`,
    [userId]
  );
  return rows as Sighting[];
}
