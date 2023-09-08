import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from 'App/Models/User';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import { isEmpty, returnResponse } from 'App/Helpers/Helper';
import AuthResource from 'App/Resources/AuthResource';


export default class AuthController {
  private wrong = 'Something went wrong';


  public async login({ auth, request, response }: HttpContextContract) {
    try {
      const attributes = await this.validation(request)
      const token = await auth.use('api').attempt(attributes['email'], attributes['password'])
      const user = await auth.use('api').user
      return returnResponse(response, true, 'Login successful', 201, await (new AuthResource).resource(user, { token: token.token }))
    } catch (error) {
      return returnResponse(response, false, 'invalid credentials', 500, [], error);
    }
  }

  public async register({ auth, request, response }: HttpContextContract) {
    try {
      const attributes = await this.validation(request, true)
      const user = await User.create(attributes)
      const token = await auth.use('api').attempt(attributes['email'], attributes['password'])
      return returnResponse(response, true, 'Register successful', 201, await (new AuthResource).resource(user, { token: token.token }))
    } catch (error) {
      return returnResponse(response, false, this.wrong, 500, [], error);
    }
  }

  private async validation(request, is_login: boolean = false) {

    let email = [
      rules.email(),
    ]

    const letsValidate = {
      email: schema.string({ trim: true }, email),
      password: schema.string({ trim: true }, [
        rules.minLength(8),
        rules.maxLength(32),
      ]),
    }

    if (is_login) {
      letsValidate['name'] = schema.string({ trim: true }, [
        rules.minLength(3),
        rules.maxLength(255),
      ])
      email.push(rules.unique({ table: 'users', column: 'email' }))
    }

    const validationSchema = schema.create(letsValidate);

    const customMessages = {
      'name.required': 'The name field is required.',
      'name.minLength': 'The name must be at least 3 characters long.',
      'name.maxLength': 'The name may not greater than 255 characters long.',
      'email.required': 'The email field is required.',
      'email.email': 'The email must be valid email address.',
      'email.unique': 'The email is already exists.',
      'password.required': 'The password field is required.',
      'password.minLength': 'The password must be at least 8 characters long.',
      'password.maxLength': 'The password may not greater than 32 characters long.',
    };

    return await request.validate({
      schema: validationSchema,
      messages: customMessages
    });
  }

}
