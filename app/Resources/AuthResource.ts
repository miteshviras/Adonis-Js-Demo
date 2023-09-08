import User from 'App/Models/User';

export default class AuthResource {

  /************************/
  /** @param options holds key and pair **/
  /** @eg {key : value} **/
  /************************/

  public async resource(array: User, options: object = {}) {
    return Object.assign({}, {
      id: array.id,
      name: array.name,
      email: array.email,
      status: array.status,
    }, options);
  }

}
