import {PrismaClient} from "@prisma/client";
import { CreateCustomer } from "../types/CreateCustomer";

const prisma = new PrismaClient();

export const Add = async (data: CreateCustomer) => {
    try{
        return await prisma.customer.create({data});
    }catch(error){
        return false
    }
}

export const getCustomerByUuid = async (customer_uuid: string) => {
    try{
        return await prisma.customer.findFirst({where:{id: customer_uuid}})
    }catch(error){
        return false;
    }
}