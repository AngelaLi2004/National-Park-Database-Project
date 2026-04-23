// src/routes/sightingRoute.ts
import express, { Request, Response } from "express";
import { uploadImage, deleteSighting, addSighting, updateSighting, getSightingsBySpeciesAndPark, getSightingsByUser } from "../services/database";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Add a new sighting
router.post("/", upload.single("image"), async (req: Request, res: Response) => {
  try {
    let imageUrl: string | null = null;
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    }
    const sighting = {
        UserID: req.body.UserID,
        LocationID: req.body.LocationID,
        SpeciesID: req.body.SpeciesID,
        SightingDate: req.body.SightingDate,
        ImageURL: imageUrl ?? undefined,
        Description: req.body.Description,
    };
    const sighting_res = await addSighting(sighting);
    res.status(201).json(sighting_res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add sighting" });
  }
});

// Delete a sighting
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteSighting(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete sighting" });
  }
});

// Update a sighting
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const updatedSighting = { ...req.body, SightingID: Number(req.params.id) };
    await updateSighting(updatedSighting);
    res.status(200).json(updatedSighting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update sighting" });
  }
});

// Get sightings by user
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const sightings = await getSightingsByUser(Number(req.params.userId));
    res.json(sightings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sightings" });
  }
});

// Get sightings by species and optional park
// /api/sightings?speciesId=5&parkCode=YNP
router.get("/", async (req: Request, res: Response) => {
  try {
    const speciesId = req.query.speciesId ? Number(req.query.speciesId) : undefined;
    const parkCode = req.query.parkCode ? String(req.query.parkCode) : undefined;

    if (!speciesId) {
      return res.status(400).json({ message: "speciesId is required" });
    }

    const sightings = await getSightingsBySpeciesAndPark(speciesId, parkCode);
    res.json(sightings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sightings" });
  }
});

export default router;