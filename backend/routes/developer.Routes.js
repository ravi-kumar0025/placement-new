
import express from "express"
import Developer from "../models/Developer.js";
const router = express.Router();

// GET all public developers
router.get('/', async (req, res) => {
    try {
        const developers = await Developer.find({ isPublic: true });
        return res.status(200).json(developers);
    } catch (error) {
        console.error('Error fetching developers:', error);
        res.status(500).json({ message: 'could not retrieve the developers' });
    }
});

export default router

