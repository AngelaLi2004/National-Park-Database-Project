import { Species } from "../models/species";
import { User } from '../models/user';
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
