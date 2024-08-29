import { z } from 'zod';
import { Base64 } from 'js-base64';

const measureTypeEnum = z.enum(['WATER', 'GAS']);

export const uploadImageSchema = z.object({
    image: z.string().refine(val => {
        const base64PrefixPattern = /^data:image\/(png|jpeg|jpg);base64,/;
        return base64PrefixPattern.test(val) && Base64.isValid(val.split(',')[1]);
    }, {
        message: 'A imagem deve estar no formato base64 e seguir o prefixo correto.',
    }),
    customer_code: z.string().min(1, 'O código do cliente é obrigatório.'),
    measure_datetime: z.string().datetime({ message: 'A data deve ser uma data válida.' }),
    measure_type: z.preprocess(
        (val) => {
            return typeof val === 'string' ? val.toUpperCase() : null;
        },
        measureTypeEnum
    ),
});