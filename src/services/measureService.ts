import { Measure, PrismaClient } from "@prisma/client";
import { MeasureType } from "../types/MeasureType";
import { CreateMeasure } from "../types/CreateMeasure";
import { MeasuresResponseBody } from "../types/MeasuresResponseBody";

const prisma = new PrismaClient();

export const thereIsSameMeasureType = async (
  customer_code: string,
  measure_datetime: string,
  mensureType: MeasureType
): Promise<Measure | null> => {
  try {
    return await prisma.measure.findFirst({
      where: {
        measure_type: mensureType,
        customer_code: customer_code,
        measure_datetime: {
          gte: new Date(
            new Date(measure_datetime).getFullYear(),
            new Date(measure_datetime).getMonth(),
            1
          ),
          lt: new Date(
            new Date(measure_datetime).getFullYear(),
            new Date(measure_datetime).getMonth() + 1,
            1
          ),
        },
      },
    });
  } catch (error) {
    return null;
  }
};

export const Add = async (data: CreateMeasure): Promise<Measure | false> => {
  try {
    return await prisma.measure.create({ data });
  } catch (error) {
    console.log("erro measureService.Add");
    console.log(error);
    return false;
  }
};

export const getMeasureByUuid = async (
  uuid: string
): Promise<Measure | null> => {
  try {
    return await prisma.measure.findFirst({ where: { uuid } });
  } catch (error) {
    return null;
  }
};

export const confirmMeasureValue = async (
  uuid: string,
  confirmed_value: number
): Promise<boolean> => {
  try {
    await prisma.measure.update({
      where: { uuid },
      data: {
        has_confirmed: true,
        measure_value: confirmed_value,
      },
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getAllMeasuresFromCustomer = async (
  customer_code: string,
  measure_type: MeasureType | undefined
): Promise<MeasuresResponseBody[] | null> => {
  try {
    const propsToSelect = {
      uuid: true,
      measure_datetime: true,
      measure_type: true,
      has_confirmed: true,
      image_url: true,
    };

    const measures = await prisma.measure.findMany({
      where: {
        customer_code,
        ...(measure_type && { measure_type }),
      },
      select: propsToSelect,
    });

    const response: MeasuresResponseBody[] = measures.map((measure) => ({
      measure_uuid: measure.uuid,
      measure_datetime: new Date(measure.measure_datetime),
      measure_type: measure.measure_type,
      has_confirmed: measure.has_confirmed,
      image_url: measure.image_url,
    }));

    return response;
  } catch (error) {
    return null;
  }
};
