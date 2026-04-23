import { Router, Request, Response } from "express";
import { searchLocations } from "../services/database";

const router = Router();

router.get("/search", async (req: Request, res: Response) => {
  const { name, parkCode } = req.query;

  try {
    if (!name) {
      return res.status(400).json({ message: "Location name is required" });
    }

    const locations = await searchLocations(
      name as string,
      parkCode as string | undefined
    );

    res.status(200).json(locations);
  } catch (error) {
    console.error("Error searching locations:", error);
    res.status(500).json({ message: "Error searching locations" });
  }
});

export default router;