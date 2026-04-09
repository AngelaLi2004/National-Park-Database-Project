import { Species } from "../models/species";
import pool from './connection';
import { RowDataPacket } from "mysql2";

// Get all species (limit 10 for demo)
export async function getAllSpecies(): Promise<Species[]> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM national_park_species_database.Species LIMIT 10;');
  
  return rows as Species[];
}

// Get species by park name (join through ParkSpecies)
export async function getSpeciesByParkName(parkName: string): Promise<Species[]> {
  const sqlQuery = `
    SELECT s.* 
    FROM national_park_species_database.Species s
    JOIN national_park_species_database.ParkSpecies ps ON s.id = ps.speciesId
    JOIN national_park_species_database.NationalPark p ON ps.parkId = p.id
    WHERE LOWER(p.ParkName) LIKE CONCAT('%', ?, '%')
    LIMIT 10;
  `;
  const [rows] = await pool.query<RowDataPacket[]>(sqlQuery, [parkName.toLowerCase()]);
  return rows as Species[];
}

// Get species by name
export async function getSpeciesByCommonName(speciesName: string): Promise<Species[]> {
  const sqlQuery = `
    SELECT * 
    FROM national_park_species_database.Species
    WHERE LOWER(CommonName) LIKE CONCAT('%', ?, '%')
    LIMIT 10;
  `;
  const [rows] = await pool.query<RowDataPacket[]>(sqlQuery, [speciesName.toLowerCase()]);
  return rows as Species[];
}

