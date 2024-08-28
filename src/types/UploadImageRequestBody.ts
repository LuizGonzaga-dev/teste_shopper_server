import { MeasureType } from "./MeasureType";

export type UploadImageRequestBody = {
    image : string;
    customer_code: string;
    measure_datetime: Date;
    measure_type: MeasureType
}