import {Router} from "express";
import { seatBooking, showBookedSeat, resetBooking} from "../Controllers/seatBooking.controller.js";

const router=Router();

router.route("/seatBooking").post(seatBooking);
router.route("/showBookedSeat").get(showBookedSeat);
router.route("/resetBooking").post(resetBooking);



export default router;