import { MeasureType } from "../MeasureType";

export type UploadRequestBody = {
  image: string;
  customer_code: string;
  measure_datetime: string;
  measure_type: MeasureType;
};
