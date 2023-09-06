import { returnResponse } from 'App/Helpers/Helper';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
export default class CommonResponse {

  // public async returnResponse(is_success: boolean, message: string, status: number = 200, data: any[] = [], errors: any[] = [], { request, response }: HttpContextContract) {
  //   let errorMessages: any[] = [];

  //   if (errors.messages != null) {
  //     errorMessages = errors.messages.errors
  //   } else {
  //     errorMessages = [errors.message]
  //   }
  //   return response.status(status).json({ success: is_success, status: status, errors: errorMessages, message: message, data: data })
  // }

  public async returnResponse(response, returnResponse: ReturnResponse){

  }
}

interface ReturnResponse {
  'success': boolean,
  'status_code': number,
  'errors': any[],
  'message': string,
  'data': any[],
}


