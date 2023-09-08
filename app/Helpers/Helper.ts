import Drive from '@ioc:Adonis/Core/Drive';
import { FileJSON } from "@ioc:Adonis/Core/BodyParser";

/************************/
// global function to check the satisfiable conditions
/************************/

function isEmpty(value) {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (typeof value === 'boolean' && !value) ||
    (typeof value === 'number' && value === 0) ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
}



/************************/
// get full file path with url
/************************/

async function getFilePath(path: string) {
  let url = await Drive.getUrl(path)
  return process.env.APP_URL + url;
}



/************************/
/*
@param response is response contact.
@param status indicates status code.
*/
/************************/
function returnResponse(response, is_success: boolean, message: string, status: number = 200, data: any[] = [], errors: any[] = []) {
  let errorMessages: any[] = [];

  if (!isEmpty(errors)) {
    if (errors.messages != null) {
      errorMessages = errors.messages.errors
    } else {
      errorMessages = [errors.message]
    }
  }

  return response.status(status).json({ success: is_success, status: status, errors: errorMessages, message: message, data: data })
}

async function fileUploads(file: FileJSON, fileDestination = 'uploads/') {
  await file.move(fileDestination, {
    name: file.clientName
  });
  return fileDestination + file.clientName;
}


// Export the specific function you want to import in other files
module.exports = {
  isEmpty, getFilePath, returnResponse, fileUploads
};
