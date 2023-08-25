import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from 'App/Models/User';
import { schema, rules } from '@ioc:Adonis/Core/Validator';


export default class AuthController {

  public async login({ auth, request, response }: HttpContextContract) {
    try {
      const attributes = await this.validation(request)
      const token = await auth.use('api').attempt(attributes['email'], attributes['password'])
      return this.returnResponse(response, true, 'Login successful', 201, { token: token.token })
    } catch (error) {
      return this.errorCapturing(error)
    }
  }

  public async register({ auth, request, response }: HttpContextContract) {
    try {
      const attributes = await this.validation(request, true)
      const user = await User.create(attributes)
      const token = await auth.use('api').attempt(attributes['email'], attributes['password'])
      return this.returnResponse(response, true, 'Register successful', 201, { token: token.token })
    } catch (error) {
      return this.errorCapturing(error)
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

  private errorCapturing(error) {
    let errorMessages: any[];

    if (error.messages != null) {
      errorMessages = error.messages
    } else {
      errorMessages = [error.message]
    }
    return errorMessages
  }

  private returnResponse(response, is_success: boolean, message: string, status: number = 200, data: any[] = []) {
    return response.status(status).json({ success: is_success, status: status, message: message, data: data })
  }
}
