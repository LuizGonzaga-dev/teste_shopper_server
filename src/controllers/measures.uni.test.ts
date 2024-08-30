import request from "supertest";
import * as customerService from "../services/customerService";
import * as measureService from "../services/measureService";
import * as geminiVisionService from "../services/geminiVisionService";

import app from "../app";
import { Measure, Customer } from "@prisma/client";
import { ConfirmRequestBody } from "../types/routes/ConfirmRequestBody";
import { UploadRequestBody } from "../types/routes/UploadRequestBody";

// Mock dos serviços
jest.mock("../services/customerService");
jest.mock("../services/measureService");
jest.mock("../services/geminiVisionService");

//variaveis globais utilizadas em diferentes testes
const measure_uuid: string = "07eb4aec-493b-4173-9f31-750369fb1c58";
const customer_code: string = "7765ca7b-f0a5-45f6-ae92-3121540db696";
const customer: Customer = { id: customer_code, name: "Test Customer" };
var fakeMeasure: Measure = {
  customer_code,
  uuid: measure_uuid,
  has_confirmed: false,
  image_url: "http://example.com/image1.png",
  measure_datetime: new Date("2024-08-27 00:00:00.000"),
  measure_type: "WATER",
  measure_value: 753,
};

describe("POST /upload", () => {
  const validImgBase64: string =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/PCVAAAAAElFTkSuQmCC";
  const invalidImgBase64: string =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/PCVAAAAAElFTkSuQm";

  it("should return 400, invalid data", async () => {
    const invalidData = {
      customer_code: "powr",
      measure_datetime: "2024-08-27 gtos 00:00:00.000",
      measure_type: "Fogo",
      image: invalidImgBase64,
    };

    const response = await request(app)
      .post("/upload")
      .send(invalidData)
      .expect("Content-Type", /json/);

    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
      error_code: "INVALID_DATA",
      error_description:
        "A imagem deve estar no formato base64, seguir o prefixo correto e conter o tipo (png, jpg, etc.), O código do cliente deve ser um UUID válido, A data deve ser uma data válida., Invalid enum value. Expected 'WATER' | 'GAS', received 'FOGO'",
    });
  });

  it("should return 409, There is already a measure for this type in the current month", async () => {
    const data: UploadRequestBody = {
      customer_code,
      measure_datetime: "2024-08-27T00:00:00.000Z",
      measure_type: "WATER",
      image: validImgBase64,
    };

    (measureService.thereIsSameMeasureType as jest.Mock).mockResolvedValue(
      fakeMeasure
    );

    const response = await request(app)
      .post("/upload")
      .send(data)
      .expect("Content-Type", /json/);

    console.log(response);
    expect(response.statusCode).toBe(409);

    expect(response.body).toEqual({
      error_code: "DOUBLE_REPORT",
      error_description: "Leitura do mês já realizada",
    });
  });

  it("should return 200, uploaded image successfully", async () => {
    const data: UploadRequestBody = {
      customer_code,
      measure_datetime: "2024-08-27T00:00:00.000Z",
      measure_type: "WATER",
      image: validImgBase64,
    };

    (measureService.thereIsSameMeasureType as jest.Mock).mockResolvedValue(
      null
    );

    (geminiVisionService.uploadImage as jest.Mock).mockResolvedValue({
      file: { uri: "http://example.com/image1.png" },
    });

    (geminiVisionService.getMeasureValue as jest.Mock).mockResolvedValue({
      response: { text: (): string => fakeMeasure.measure_value.toString() },
    });

    (measureService.Add as jest.Mock).mockResolvedValue(fakeMeasure);

    const response = await request(app)
      .post("/upload")
      .send(data)
      .expect("Content-Type", /json/);

    console.log(response);
    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      image_url: "http://example.com/image1.png",
      measure_value: fakeMeasure.measure_value,
      measure_uuid: fakeMeasure.uuid,
    });
  });
});

describe("GET /:customer_code/list", () => {
  it("should return 200, return measures when customer_code and measure_type are valid and there are measures whith this customer_code", async () => {
    // Dados simulados

    const mockMeasuresResponse = [
      {
        measure_uuid,
        measure_datetime: "2024-08-27 00:00:00.000",
        measure_type: "WATER",
        has_confirmed: true,
        image_url: "http://example.com/image1.png",
      },
    ];

    (customerService.getCustomerByUuid as jest.Mock).mockResolvedValue(
      customer
    );
    (measureService.getAllMeasuresFromCustomer as jest.Mock).mockResolvedValue(
      mockMeasuresResponse
    );

    await request(app)
      .get(`/${customer_code}/list?measure_type=WATER`)
      .expect("Content-Type", /json/)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
          customer_code: "7765ca7b-f0a5-45f6-ae92-3121540db696",
          measures: mockMeasuresResponse,
        });
      });
  });

  it("should return 404 if customer is not found", async () => {
    (customerService.getCustomerByUuid as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .get(`/${customer_code}/list`)
      .expect("Content-Type", /json/)
      .expect(404);

    expect(response.body).toEqual({
      error_code: "CUSTOMER_NOT_FOUND",
      error_description: "Customer code incorreto",
    });
  });

  it("should return 404 if no measures are found", async () => {
    (customerService.getCustomerByUuid as jest.Mock).mockResolvedValue(
      customer
    );
    (measureService.getAllMeasuresFromCustomer as jest.Mock).mockResolvedValue(
      []
    );

    const response = await request(app)
      .get(`/${customer_code}/list?measure_type=water`)
      .expect("Content-Type", /json/)
      .expect(404);

    expect(response.body).toEqual({
      error_code: "MEASURES_NOT_FOUND",
      error_description: "Nenhuma leitura encontrada",
    });
  });

  it("should return just water measure type", async () => {
    const mockMeasuresResponse = [
      {
        measure_uuid,
        measure_datetime: "2024-08-27 00:00:00.000",
        measure_type: "WATER",
        has_confirmed: true,
        image_url: "http://example.com/image1.png",
      },
      {
        measure_uuid,
        measure_datetime: "2024-08-27 00:00:00.000",
        measure_type: "WATER",
        has_confirmed: true,
        image_url: "http://example.com/image1.png",
      },
    ];

    (customerService.getCustomerByUuid as jest.Mock).mockResolvedValue(
      customer
    );
    (measureService.getAllMeasuresFromCustomer as jest.Mock).mockResolvedValue(
      mockMeasuresResponse
    );

    const response = await request(app)
      .get(`/${customer_code}/list?measure_type=WATER`)
      .expect("Content-Type", /json/);

    expect(response.statusCode).toBe(200);

    expect(
      response.body.measures.every(
        (measure: any) => measure.measure_type === "WATER"
      )
    ).toBe(true);

    expect(response.body).toEqual({
      customer_code,
      measures: mockMeasuresResponse,
    });
  });

  it("should return all measures including different types", async () => {
    const mockMeasuresResponse = [
      {
        measure_uuid,
        measure_datetime: "2024-08-27 00:00:00.000",
        measure_type: "WATER",
        has_confirmed: true,
        image_url: "http://example.com/image1.png",
      },
      {
        measure_uuid,
        measure_datetime: "2024-08-27 00:00:00.000",
        measure_type: "GAS",
        has_confirmed: true,
        image_url: "http://example.com/image1.png",
      },
    ];

    (customerService.getCustomerByUuid as jest.Mock).mockResolvedValue(
      customer
    );
    (measureService.getAllMeasuresFromCustomer as jest.Mock).mockResolvedValue(
      mockMeasuresResponse
    );

    const response = await request(app)
      .get(`/${customer_code}/list`)
      .expect("Content-Type", /json/);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      customer_code,
      measures: mockMeasuresResponse,
    });
  });
});

describe("PATCH /confirm", () => {
  it("should return 400, data provided in the body of the request are invalid", async () => {
    (measureService.getMeasureByUuid as jest.Mock).mockReturnValue(null);

    const invalidData = {
      measure_uuid: "eaarado",
      confirmed_value: "true",
    };

    const response = await request(app)
      .patch("/confirm")
      .send(invalidData)
      .expect("Content-Type", /json/);
    expect(response.statusCode).toBe(400);

    expect(response.body).toEqual({
      error_code: "INVALID_DATA",
      error_description:
        "O código da medição deve ser um UUID válido. Expected number, received string",
    });
  });

  it("should return 404, measure not found", async () => {
    (measureService.getMeasureByUuid as jest.Mock).mockReturnValue(null);

    const data: ConfirmRequestBody = {
      confirmed_value: 500,
      measure_uuid,
    };

    const response = await request(app)
      .patch("/confirm")
      .send(data)
      .expect("Content-Type", /json/);

    expect(response.statusCode).toBe(404);

    expect(response.body).toEqual({
      error_code: "MEASURE_NOT_FOUND",
      error_description: "Leitura do mês já realizada",
    });
  });

  it("should return 409, measure already confirmed", async () => {
    fakeMeasure.has_confirmed = true;

    (measureService.getMeasureByUuid as jest.Mock).mockResolvedValue(
      fakeMeasure
    );

    const data: ConfirmRequestBody = {
      confirmed_value: 900,
      measure_uuid: fakeMeasure.customer_code,
    };

    const response = await request(app)
      .patch("/confirm")
      .send(data)
      .expect("Content-Type", /json/);

    expect(response.statusCode).toBe(409);

    expect(response.body).toEqual({
      error_code: "CONFIRMATION_DUPLICATE",
      error_description: "Leitura do mês já realizada",
    });
  });

  it("shold return 200, measure saved successfully", async () => {
    fakeMeasure.has_confirmed = false;

    (measureService.getMeasureByUuid as jest.Mock).mockResolvedValue(
      fakeMeasure
    );
    (measureService.confirmMeasureValue as jest.Mock).mockResolvedValue(true);

    const data = {
      confirmed_value: "900",
      measure_uuid: fakeMeasure.uuid,
    };

    const response = await request(app)
      .patch("/confirm")
      .send(data)
      .expect("Content-Type", /json/);

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      success: true,
    });
  });
});
