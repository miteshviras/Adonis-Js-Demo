import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CustomAuthMiddleware {
  protected async authenticate(auth: HttpContextContract['auth']) {
    if (await auth.use('api').check()) {
      /**
       * Instruct auth to use the given guard as the default guard for
       * the rest of the request, since the user authenticated
       * succeeded here
       */
      auth.defaultGuard = 'api'
      return true
    }

    /**
     * Unable to authenticate using any guard
     */
    return false
  }

  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (await this.authenticate(auth) === false) {
      return response.status(401).json({ success: false, status: 401, message: 'Unauthorized: You need to log in to access.', data: [] })
    }
    await next()
  }
}
