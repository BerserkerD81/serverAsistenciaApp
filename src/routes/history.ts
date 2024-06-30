import{Router} from "express";
import {getHistory} from "../controllers/history";

const router = Router()

router.post("/",getHistory)


export default router;