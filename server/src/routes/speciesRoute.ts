import { Router, Request, Response } from "express";
import { searchSpecies, getSpeciesByPark, enrichSpeciesWithImages, getSpeciesDetailByPark, getParksBySpeciesId } from "../services/database";
import { Species } from "../models/species";

const router = Router();

// Search species with filters
// /api/species/search?name=deer&searchType=common&category=Mammal&park=Yellowstone&order=asc
router.get("/search", async (req: Request, res: Response) => {
  const { 
    name,
    searchType = 'common',  // common/scientific
    category,
    park,
    order = 'asc'
  } = req.query;

  try {
    if (!name) {
      return res.status(400).json({ message: "Species name is required" });
    }

    const species: Species[] = await searchSpecies(
      name as string,
      searchType as 'common' | 'scientific',
      category as string | undefined,
      park as string | undefined,
      order as 'asc' | 'desc'
    );

    const enriched = await enrichSpeciesWithImages(species);

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Error searching species" });
    console.error('Error:', error);
  }
});

// Search by national park
// /api/species/by-park?park=Yellowstone&category=Mammal&order=asc
router.get("/by-park", async (req: Request, res: Response) => {
  const { 
    park,
    category,
    order = 'asc'
  } = req.query;

  try {
    if (!park) {
      return res.status(400).json({ message: "Park name is required" });
    }

    const species: Species[] = await getSpeciesByPark(
      park as string,
      category as string | undefined,
      order as 'asc' | 'desc'
    );

    if (species.length > 0) {
      res.status(200).json(species);
    } else {
      res.status(404).json({ message: `No species found in park: ${park}` });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching species by park" });
    console.error('Error:', error);
  }
});

router.get("/:speciesId/parks", async (req: Request, res: Response) => {
  try {
    const speciesId = Number(req.params.speciesId);

    if (!speciesId) {
      return res.status(400).json({ message: "Valid speciesId is required" });
    }

    const parks = await getParksBySpeciesId(speciesId);
    res.status(200).json(parks);
  } catch (error) {
    console.error("Error fetching parks by speciesId:", error);
    res.status(500).json({ message: "Error fetching parks for species" });
  }
});

// GET /api/species/detail?speciesId=123&parkCode=GLAC
router.get("/detail", async (req: Request, res: Response) => {
  const { speciesId, parkCode } = req.query;

  if (!speciesId || !parkCode) {
    return res.status(400).json({ message: "speciesId and parkCode are required" });
  }

  try {
    const detail = await getSpeciesDetailByPark(
      Number(speciesId),
      parkCode as string
    );
    res.status(200).json(detail);
  } catch (error) {
    res.status(500).json({ message: "Error fetching species detail" });
    console.error('Error:', error);
  }
});

export default router;