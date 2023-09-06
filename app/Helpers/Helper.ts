import { Response } from "@adonisjs/core/build/standalone";
import CommonResponse from "App/Helpers/CommonResponse";
// global function to check the satisfiable conditions
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

function getFilePath(path: string): string {
  return process.env.APP_URL + path;
}

function returnResponse(is_success: boolean, message: string, status: number = 200, data: any[] = [], errors: any[] = []) {
  const commonResponse = (new CommonResponse).returnResponse(Response,);
  return commonResponse.returnResponse(is_success,message,status,data,errors);
}


// Export the specific function you want to import in other files
module.exports = {
  isEmpty, getFilePath, returnResponse
};
