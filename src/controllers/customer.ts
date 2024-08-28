import { RequestHandler } from "express";
import { z } from "zod";
import { CreateCustomer } from "../types/CreateCustomer";
import * as customerService from "../services/customerService";


export const Add : RequestHandler = async (req, res) => {

    const createSchema = z.object({
        name: z.string().min(1, {message: "Nome é obrigatório!"})
    });

    const dataIsValid = createSchema.safeParse(req.body);

    if (!dataIsValid.success) {
        return res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: dataIsValid.error.errors.map(e => e.message).join(', '),
        });
    }

    const { name } = dataIsValid.data;

    const customerData: CreateCustomer = { name };

    const created = await customerService.Add(customerData);

    if(created){
        return res.status(200).json({
            success: true,
            customer_code: created.id,
            customer_name: created.name
        });
    }else{
        return res.status(400).json({
            error_code: 'ERROR_CODE',
            error_description: 'Não conseguimos adicionar o cliente',
        });
    }
}