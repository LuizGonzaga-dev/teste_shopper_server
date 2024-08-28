import { genAI, genAiFileManager, model } from "../gemini_api/config";
import { MeasureType } from "../types/MeasureType";
import path from "path";
import { promises as fs } from 'fs';
// export const uploadImage = async (img: string) => {


//     const response = null;
    
//     try{
//       console.log(getImgTypeFromBase64(img));
//       var reponse = await genAiFileManager.uploadFile(img);
//     }catch(errpr){
//       var hmmm = "";
//     }
//     return await genAiFileManager.uploadFile(img);
// }

export const uploadImage = async (imgBase64: string) => {

  try {

    var oxem = await getMeasureValuei();

      // Identifique o tipo de imagem a partir da string base64
      const match = imgBase64.match(/^data:image\/(\w+);base64,/);
      const imageType = match ? match[1] : null; // 'jpeg', 'png', etc.

      if (!imageType) {
          throw new Error('Tipo de imagem não identificado');
      }

      // Defina o mimeType correto para o upload
      const mimeType = `image/${imageType}`;
      
      // Remova o prefixo base64
      const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, '');
      
      // Converta o base64 em um Buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Defina um caminho temporário para salvar a imagem com a extensão correta
      const tempFilePath = path.join(__dirname, `tempImage.${imageType}`);

      // Salve o Buffer como um arquivo com a extensão correta
      await fs.writeFile(tempFilePath, buffer);

      // Faça o upload usando o fileManager.uploadFile
      const uploadResponse = await genAiFileManager.uploadFile(tempFilePath, {
          mimeType: mimeType,
          displayName: "Uploaded Image",
      });

      // Após o upload, remova o arquivo temporário
      await fs.unlink(tempFilePath);

      return uploadResponse;

  } catch (error) {
      return false;
  }

}

export const getMeasureValue = async (uploadResult: any, measure_type: MeasureType) => {
  try{

    return await model.generateContent([
        {
          fileData: {
            // fileUri: uploadResult.file.uri,
            // mimeType: uploadResult.file.mimeType,
            fileUri:"https://generativelanguage.googleapis.com/v1beta/files/gtgue1htubtd",
            mimeType:"image/jpeg"
          },
        },
        {
          text:`Retorne-me o valor da medição do consumo desse medidor de consumo de agua ou gas, retorne apenas o numero, caso não consiga identificar a medida retorne zero`,
        }
    ]);

  }catch(error){
    return null;
  }
}

export const getMeasureValuei = async () => {
  try{

    const result = await model.generateContent([        
        {
          fileData: {
            // fileUri: uploadResult.file.uri,
            // mimeType: uploadResult.file.mimeType,
            fileUri:"https://generativelanguage.googleapis.com/v1beta/files/gtgue1htubtd",
            mimeType:"image/jpeg"
          },
        },
        {
          text:`Retorne-me o valor da medição do consumo desse medidor de consumo de agua ou gas, retorne apenas o numero, caso não consiga identificar a medida retorne zero`,
        }
    ]);

    console.log(result.response.text())
    return result;
  }catch(error){
    var hmm = ""
  }
}