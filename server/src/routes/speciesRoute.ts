import { Router, Request, Response } from "express";
import { getAllSpecies, getSpeciesByCommonName } from "../services/database";
import { Species } from "../models/species";

const router = Router();

// api/species?search=name
router.get("/", async (req: Request, res: Response) => {
  // if there is no query parameter, return all Pokémon
  if (!req.query.search) {
    try {
      const allSpecies: Species[] = await getAllSpecies();
      res.status(200).json(allSpecies);
    } catch (error) {
      res.status(500).json({ message: "Error fetching species" });
      // console.error('❌ DB connection failed:', error);
    }
  } else {
    const query = req.query.search as string;
    try {
      const Species = await getSpeciesByCommonName(query);
      res.status(200).json(Species);
    } catch (error) {
      res.status(500).json({ message: "Error fetching species" });
    }
  }
});

export default router;