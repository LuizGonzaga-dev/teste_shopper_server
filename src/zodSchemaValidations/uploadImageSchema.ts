import { z } from "zod";
import { isBase64 } from "../utils/helpers";

const measureTypeEnum = z.enum(["WATER", "GAS"]);

export const uploadImageSchema = z.object({
  image: z.string().refine(
    (val) => {
      const base64PrefixPattern = /^data:image\/(png|jpeg|jpg);base64,/;
      const hasValidPrefix = base64PrefixPattern.test(val);

      if (!hasValidPrefix) return false;

      const base64Data = val.split(",")[1];

      var res = isBase64(base64Data);
      return res;
    },
    {
      message:
        "A imagem deve estar no formato base64, seguir o prefixo correto e conter o tipo (png, jpg, etc.)",
    }
  ),
  customer_code: z
    .string({ message: "informe o uuid do cliente" })
    .min(1, "O código do cliente é obrigatório.")
    .uuid("O código do cliente deve ser um UUID válido"),
  measure_datetime: z
    .string({ message: "Informe uma data de medição válida" })
    .min(1, "A data de medição é obrigatória")
    .datetime({ message: "A data deve ser uma data válida." }),
  measure_type: z.preprocess((val) => {
    return typeof val === "string" ? val.toUpperCase() : null;
  }, measureTypeEnum),
});
