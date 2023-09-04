import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Post from 'App/Models/Post';
import { schema, rules } from '@ioc:Adonis/Core/Validator';


export default class PostsController {
  private wrong = 'Something went wrong'

  public async index({ request, response }: HttpContextContract) {
    try {
      const posts = await Post.query().preload('postImages', (postImagesQuery) => {
        postImagesQuery
      })
      return this.returnResponse(response, true, 'posts fetched successfully.', 201, [post]);
    } catch (error) {
      return this.returnResponse(response, false, this.wrong, 500, [], error);
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      // checked the validation if fails directly goes in catch.
      const attributes = await this.commonValidation(request);

      const post = await Post.create(attributes);
      return this.returnResponse(response, true, 'posts added successfully.', 201, [post]);
    } catch (error) {
      return this.returnResponse(response, false, this.wrong, 500, [], error);
    }
  }

  public async show({ }: HttpContextContract) { }

  public async update({ request, response }: HttpContextContract) {
    const post_id = request.param('id')
    try {
      console.clear();
      // checked the validation if fails directly goes in catch.
      const attributes = await this.commonValidation(request);
      const files = await this.fileUpload(request)
      return files
      const post = await Post.query().where('id', post_id).first();

      // this merge method will merge the attributes into the methods.
      post.merge(attributes).save();

      // const post = await Post.create(attributes);
      return this.returnResponse('success', [post], ['posts fetched successfully.'])
    } catch (error) {
      return this.returnResponse(response, false, this.wrong, 500, [], error);
    }
  }

  public async destroy({ request, response }: HttpContextContract) {
    const post_id = request.param('id')
    try {
      const post = await Post.query().where('id', post_id).first();
      await post.delete()

      // const post = await Post.create(attributes);
      return this.returnResponse(response, true, 'posts deleted successfully.', 201, [post]);
    } catch (error) {
      return this.returnResponse(response, false, this.wrong, 500, [], error);
    }
  }

  public async setStatus({ request, response }: HttpContextContract) {
    try {
      const post_id = request.param('id')
      const post = await Post.query().where('id', post_id).first();
      const attributes: any[] = { 'status': 'active' };

      if (post.status == 'active') {
        attributes['status'] = 'inactive';
      }

      post.merge(attributes).save();
      return this.returnResponse(response, true, 'posts sets to ' + attributes['status'] + ' successfully.', 201, []);
    } catch (error) {
      return this.returnResponse(response, false, this.wrong, 500, [], error);
    }
  }

  private returnResponse(response, is_success: boolean, message: string, status: number = 200, data: any[] = [], errors: any[] = []) {
    let errorMessages: any[] = [];

    if(errors.length > 0){
      errorMessages = errors.messages.errors
      if (errors.messages != null) {
      } else {
        errorMessages = [errors.message]
      }
    }

    return response.status(status).json({ success: is_success, status: status, errors: errorMessages, message: message, data: data })
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

  private async fileUpload(request) {
    const coverImage = request.files('images', {
      extnames: ['jpg', 'png', 'jpeg'],
      size: '2kb'
    })
    console.log(coverImage);
    return coverImage
  }
}
