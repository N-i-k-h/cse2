import express from 'express';
// import { query } from 'express-validator'; // Not using for now
const router = express.Router();

router.get('/', (req, res) => {
    res.json([]);
});

export default router;
