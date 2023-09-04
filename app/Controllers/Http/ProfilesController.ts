import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator';


export default class ProfilesController {
  public async index({ auth, request, response }: HttpContextContract) {
    const thisAuth = await auth.use('api').user
    return this.returnResponse(response, true, 'Profile fetched successfully.', 200, thisAuth)
  }

  // here we update the profile
  public async store({ auth, request, response }: HttpContextContract) {
    const validationSchema = schema.create({
      name: schema.string({ trim: true }, [
        rules.minLength(3),
        rules.maxLength(255),
      ])
    });

    const customMessages = {
      'name.required': 'The name field is required.',
      'name.minLength': 'The name must be at least 3 characters long.',
      'name.maxLength': 'The name may not be longer than 255 characters.',
    };
    try {
      const thisAuth = await auth.use('api').user
      const attributes = await request.validate({
        schema: validationSchema,
        messages: customMessages
      });

      thisAuth.merge(attributes).save();
      return this.returnResponse(response, true, 'Profile Updated successfully.', 200, thisAuth)
    } catch (error) {
      return this.returnResponse(response, false, 'something went wrong', 422, [], error);
    }
  }

  public async destroy({ auth, request, response }: HttpContextContract) {
    try {
      const thisAuth = await auth.use('api').user
      thisAuth.delete();
      return this.returnResponse(response, true, 'Your Account has been deleted.', 200, thisAuth)
    } catch (error) {
      return this.returnResponse(response, false, 'something went wrong', 422, [], error);
    }
  }

  private returnResponse(response, is_success: boolean, message: string, status: number = 200, data: any[] = [], errors: any[] = []) {
    let errorMessages: any[] = [];

    if (errors.messages != null) {
      errorMessages = errors.messages.errors
    } else {
      if (errors.message != null) {
        errorMessages = [errors.message]
      }
    }

    return response.status(status).json({ success: is_success, status: status, message: message, data: data, errors: errorMessages })
  }

}
