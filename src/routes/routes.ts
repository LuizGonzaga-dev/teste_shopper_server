import { Router } from "express";
import * as measure from "../controllers/measures";
import * as customer from "../controllers/customer";
import { validateConfirmRequestBody, validatCustomerlistRequestBody } from "../utils/middlewares";

const router = Router();

router.get('/ping', (req, res) => res.json({pong: true}));
router.get('/:customer_code/list', validatCustomerlistRequestBody , measure.listMeasures);

router.patch('/confirm', validateConfirmRequestBody , measure.confirm);

router.post('/upload', measure.upload);
router.post('/add_customer', customer.Add);

export default router;