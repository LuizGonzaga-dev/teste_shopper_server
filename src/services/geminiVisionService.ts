import { genAI, genAiFileManager, model } from "../gemini_api/config";
import { MeasureType } from "../types/MeasureType";
import path from "path";
import { promises as fs } from 'fs';

export const uploadImage = async (imgBase64: string) => {

  try {

      // Identifica o tipo de imagem a partir da string base64
      const match = imgBase64.match(/^data:image\/(\w+);base64,/);
      const imageType = match ? match[1] : null; // 'jpeg', 'png', etc.

      if (!imageType) {
          throw new Error('Tipo de imagem não identificado');
      }

      // Define o mimeType correto para o upload
      const mimeType = `image/${imageType}`;
      
      // Remove o prefixo base64
      const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, '');
      
      // Converte o base64 em um Buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Define um caminho temporário para salvar a imagem com a extensão correta
      const tempFilePath = path.join(__dirname, `tempImage.${imageType}`);

      // Salva o Buffer como um arquivo com a extensão correta
      await fs.writeFile(tempFilePath, buffer);

      // Faz o upload usando o fileManager.uploadFile
      const uploadResponse = await genAiFileManager.uploadFile(tempFilePath, {
          mimeType: mimeType,
          displayName: "Uploaded Image",
      });

      // Após o upload, remove o arquivo temporário
      await fs.unlink(tempFilePath);

      return uploadResponse;

  } catch (error) {
      console.log(error)
      return false;
  }

}

export const getMeasureValue = async (uploadResult: any) => {
  try{
    var response = await model.generateContent([
        {
          fileData: {
            fileUri: uploadResult.file.uri,
            mimeType: uploadResult.file.mimeType,
          },
        },
        {
          text:`Retorne-me o valor da medição do consumo desse medidor de consumo de agua ou gas, retorne apenas uma string que possa ser convertida para um numero inteiro (caso a primeira casa decimal seja menor ou igual a 5 arredonde para menos, do controrio arrendonde para mais), caso não consiga identificar a medida retorne zero`,
        }
    ]);
    return response;
  }catch(error){
    console.log(error)
    return null;
  }
}
