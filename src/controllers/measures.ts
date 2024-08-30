import { RequestHandler } from "express";
import { uploadImageSchema } from "../zodSchemaValidations/uploadImageSchema";
import * as measureService from "../services/measureService";
import * as customerService from "../services/customerService";
import * as geminiVisionService from "../services/geminiVisionService";
import { CreateMeasure } from "../types/CreateMeasure";
import { MeasureType } from "../types/MeasureType";
import { ConfirmRequestBody } from "../types/routes/ConfirmRequestBody";

export const upload: RequestHandler = async (req, res) => {
  //usa o zod pra validar os dados
  const dataIsValid = uploadImageSchema.safeParse(req.body);

  //retorna os erros que foram diagnosticados pelo zod
  if (!dataIsValid.success) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: dataIsValid.error.errors
        .map((e) => e.message)
        .join(", "),
    });
  }

  const { image, customer_code, measure_datetime, measure_type } =
    dataIsValid.data;

  //verifica se ja tem leitura no banco de dados
  const measureOnDb = await measureService.thereIsSameMeasureType(
    customer_code,
    measure_datetime,
    measure_type
  );

  if (measureOnDb) {
    return res.status(409).json({
      error_code: "DOUBLE_REPORT",
      error_description: "Leitura do mês já realizada",
    });
  }

  //tenta enviar a imagem pra IA
  const uploadResponse = await geminiVisionService.uploadImage(image);

  if (!uploadResponse) {
    return res.status(409).json({
      error_code: "ERROR_CODE",
      error_description: "Não foi possível fazer o upload da imagem",
    });
  }

  //pede para IA fazer a medição
  const geminiImgInfos = await geminiVisionService.getMeasureValue(
    uploadResponse
  );

  if (!geminiImgInfos) {
    return res.status(409).json({
      error_code: "ERROR_CODE",
      error_description: "Houve um erro ao consultar a medição com a IA",
    });
  }
  //salva o valor da medição da IA na variavel abaixo
  var ia_measure_value = parseInt(
    (geminiImgInfos.response.text() as string).trim()
  );

  var measureData: CreateMeasure = {
    has_confirmed: false,
    image_url: uploadResponse.file.uri,
    measure_datetime: measure_datetime,
    measure_type: measure_type,
    measure_value: ia_measure_value,
    customer_code: customer_code,
  };

  //adiciona medição no banco de dados
  const measure = await measureService.Add(measureData);

  if (!measure) {
    return res.status(409).json({
      error_code: "ERROR_CODE",
      error_description: "Não foi possível salvar a medição",
    });
  }

  //tudo deu certo, amém
  return res.status(200).json({
    image_url: measure.image_url,
    measure_value: measure.measure_value,
    measure_uuid: measure.uuid,
  });
};

export const confirm: RequestHandler = async (req, res) => {
  const { measure_uuid, confirmed_value } = req.body as ConfirmRequestBody;

  //busca medição no banco de dados
  const measure = await measureService.getMeasureByUuid(measure_uuid);

  //não encontrou a medição
  if (!measure) {
    return res.status(404).json({
      error_code: "MEASURE_NOT_FOUND",
      error_description: "Leitura do mês já realizada",
    });
  }

  //a medição já havia sido confirmada
  if (measure.has_confirmed) {
    return res.status(409).json({
      error_code: "CONFIRMATION_DUPLICATE",
      error_description: "Leitura do mês já realizada",
    });
  }

  //atualiza a medição confirmando a medição e atualizando com o valor confirmado
  var updated = await measureService.confirmMeasureValue(
    measure_uuid,
    parseFloat(confirmed_value.toString())
  );

  if (updated) {
    return res.status(200).json({
      success: true,
    });
  } else {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: "Não foi possível confirmar a medição!",
    });
  }
};

export const listMeasures: RequestHandler = async (req, res) => {
  const { measure_type } = req.query;
  const { customer_code } = req.params;

  var measureType: undefined | MeasureType;

  if (typeof measure_type === "string")
    measureType = measure_type.toUpperCase() as MeasureType;

  const customerOnDb = await customerService.getCustomerByUuid(customer_code);

  if (!customerOnDb) {
    return res.status(404).json({
      error_code: "CUSTOMER_NOT_FOUND",
      error_description: "Customer code incorreto",
    });
  }

  var measures = await measureService.getAllMeasuresFromCustomer(
    customer_code,
    measureType
  );

  if (!measures || measures.length === 0) {
    return res.status(404).json({
      error_code: "MEASURES_NOT_FOUND",
      error_description: "Nenhuma leitura encontrada",
    });
  }

  return res.status(200).json({
    customer_code,
    measures,
  });
};
