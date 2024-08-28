import { RequestHandler } from "express";
import { z, ZodError } from "zod";

export const validateConfirmRequestBody: RequestHandler = (req, res, next) => {
    
    const confirmSchema = z.object({
        measure_uuid: z.string().min(1, 'O código do medição é obrigatório.').uuid(),
        confirmed_value: z.number().int().nonnegative({message:"O número deve ser maior do que zero."})
    });

    try {
        confirmSchema.parse(req.body);
        next(); 
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error_code: 'INVALID_DATA',
                error_description: error.errors.map(e => e.message).join('. ')
            });
        } else {
            return res.status(500).json({
                error_code: 'INTERNAL_SERVER_ERROR',
                error_description: 'Erro interno do servidor'
            });
        }
    }
};

export const  validatCustomerlistRequestBody: RequestHandler = (req, res, next) => {

    const paramsSchema = z.object({
        customer_code: z.string().uuid().min(1, 'O código do cliente é obrigatório'),
    });

    const querySchema = z.object({
        measure_type: z.preprocess(
          (val) => {
            return typeof val === 'string' ? val.toUpperCase() : null;
          },
          z.enum(['WATER', 'GAS']).optional(),
        ),
    });

    try{
        paramsSchema.parse(req.params);

        const { measure_type } = req.query;

        if(measure_type)
            querySchema.parse(req.query);

        next();
    }catch(error){
        if(error instanceof ZodError){
            
            const measureTypeError = error.errors.find(issue => issue.path[0] === 'measure_type');

            if (measureTypeError) {
                return res.status(400).json({
                    error_code: 'INVALID_TYPE',
                    error_description: 'Tipo de medição não permitida'
                });
            }

            return res.status(400).json({
                error_code: 'INVALID_DATA',
                error_description: error.errors.map(e => e.message).join('. '),
            });
        }else {
            res.status(500).json({
                error_code: 'INTERNAL_SERVER_ERROR',
                error_description: 'Erro interno do servidor'
            });
        }
    }

}