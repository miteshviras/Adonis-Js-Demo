import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Post from 'App/Models/Post';
import { schema, rules } from '@ioc:Adonis/Core/Validator';


export default class PostsController {
  public async index({ request }) {
    try {
      const posts = await Post.all();
      return this.returnResponse('success', posts, ['posts fetched successfully.'])
    } catch (error) {
      return this.returnResponse('success', [error.message]);
    }
  }

  public async store({ request }: HttpContextContract) {
    try {
      // checked the validation if fails directly goes in catch.
      const attributes = await this.commonValidation(request);

      const post = await Post.create(attributes);
      return this.returnResponse('success', [post], ['posts fetched successfully.'])
    } catch (error) {
      let errorMessages : any[];

      if(error.messages != null){
        errorMessages = error.messages.errors.map((message) => message.message);
      }else{
        errorMessages = [error.message]
      }
      return this.returnResponse('fail', [],errorMessages);
    }
  }

  public async show({ }: HttpContextContract) { }

  public async update({ request }: HttpContextContract) {
    const post_id = request.param('id')
    try {
      // checked the validation if fails directly goes in catch.
      const attributes = await this.commonValidation(request);
      const post = await Post.query().where('id', post_id).first();

      // this merge method will merge the attributes into the methods.
      post.merge(attributes).save();

      // const post = await Post.create(attributes);
      return this.returnResponse('success', [post], ['posts fetched successfully.'])
    } catch (error) {
      let errorMessages : any[];

      if(error.messages != null){
        errorMessages = error.messages.errors.map((message) => message.message);
      }else{
        errorMessages = [error.message]
      }
      return this.returnResponse('fail', [],errorMessages);
    }
  }

  public async destroy({ request }: HttpContextContract) {
    const post_id = request.param('id')
    try {
      const post = await Post.query().where('id', post_id).first();
      await post.delete()

      // const post = await Post.create(attributes);
      return this.returnResponse('success', [post], ['posts deleted successfully.'])
    } catch (error) {
      let errorMessages : any[];

      if(error.messages != null){
        errorMessages = error.messages.errors.map((message) => message.message);
      }else{
        errorMessages = [error.message]
      }
      return this.returnResponse('fail', [],errorMessages);
    }
  }

  private returnResponse(status: string = 'success', data: any[] = [], messages: string[] = [], code: number = 200) {
    return [{
      status: status, data: data, messages: messages, code: code
    }]
  }

  // this is common validation function of each module
  private async commonValidation(request) {

    // the schema.create schema methods is default's required.
    const validationSchema = schema.create({
      title: schema.string({ trim: true }, [
        // rules.required(),
        rules.minLength(3),
      ]),
      description: schema.string({ trim: true }, [
        // rules.required(),
        rules.minLength(10),
      ]),
      status: schema.enum(['active', 'inactive'], [
        // rules.required(),
      ]),
    });

    const customMessages = {
      'title.required': 'The title field is required.',
      'title.minLength': 'The title must be at least 3 characters long.',
      'description.required': 'The description field is required.',
      'description.minLength': 'The description must be at least 10 characters long.',
      'status.required': 'The status field is required.',
      'status.enum': 'Invalid status value. Must be either "active" or "inactive".',
    };

    return await request.validate({
      schema: validationSchema,
      messages: customMessages
    });
  }
}
