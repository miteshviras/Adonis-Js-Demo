import { returnResponse } from 'App/Helpers/Helper';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import AuthResource from 'App/Resources/AuthResource';


export default class ProfilesController {
  public async index({ auth, request, response }: HttpContextContract) {
    const thisAuth = await auth.use('api').user
    return returnResponse(response, true, 'Profile fetched successfully.', 200, await (new AuthResource).resource(thisAuth))
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
      return returnResponse(response, true, 'Profile Updated successfully.', 200, await (new AuthResource).resource(thisAuth))
    } catch (error) {
      return returnResponse(response, false, 'something went wrong', 500, [], error);
    }
  }

  public async destroy({ auth, request, response }: HttpContextContract) {
    try {
      const thisAuth = await auth.use('api').user
      thisAuth.delete();
      return returnResponse(response, true, 'Your Account has been deleted.', 200, [])
    } catch (error) {
      return returnResponse(response, false, 'something went wrong', 500, [], error);
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').revoke()
    return returnResponse(response, true, 'Logout successfully', 200, [])
  }

}
