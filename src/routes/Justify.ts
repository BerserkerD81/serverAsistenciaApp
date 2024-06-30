import{Router} from "express";
import { postJustify } from "../controllers/Justify";

const router = Router()

router.post("/",postJustify)


export default router;