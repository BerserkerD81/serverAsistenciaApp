import{Router} from "express";
import { upload } from "../controllers/upload";

const router = Router()

router.post("/",upload);



export default router;