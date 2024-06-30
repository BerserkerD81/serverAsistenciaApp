import{Router} from "express";
import { loginUser,newUser,configUser, getUsers, deactivateUser, verifyUser, configUserAdmin } from "../controllers/user";
import { config } from "dotenv";

const router = Router()

router.post("/",newUser);
router.post("/login",loginUser);
router.post("/configUser", configUser);
router.post("/configUserAdmin", configUserAdmin);
router.get("/getUser",getUsers);
router.get("/getUser",getUsers);
router.post("/desactivar",deactivateUser);
router.post('/verify', verifyUser);




export default router;
