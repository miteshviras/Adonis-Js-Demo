import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Post from 'App/Models/Post';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import PostImage from 'App/Models/PostImage';
import { isEmpty, returnResponse } from 'App/Helpers/Helper';
import PostResource from 'App/Resources/PostResource';


export default class PostsController {
  private wrong = 'Something went wrong';
  public helper;
  public postResource;

  constructor() {
    // this.helper = new Helper
    this.postResource = new PostResource
  }

  public async index({ request, response }: HttpContextContract) {
    try {
      const posts = await Post.query().preload('postImages', (postImagesQuery) => {
        postImagesQuery
      })
      return returnResponse(response, true, 'posts fetched successfully.', 200, await this.postResource.resource(posts));
    } catch (error) {
      return returnResponse(response, false, this.wrong, 500, [], error);
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      // checked the validation if fails directly goes in catch.
      const attributes = await this.commonValidation(request);

      const post = await Post.create(attributes);
      return returnResponse(response, true, 'posts added successfully.', 201, [post]);
    } catch (error) {
      return returnResponse(response, false, this.wrong, 500, [], error);
    }
  }

  // public async show({ }: HttpContextContract) { }

  public async update({ request, response }: HttpContextContract) {
    const post_id = request.param('id')
    try {
      // checked the validation if fails directly goes in catch.
      const attributes = await this.commonValidation(request, true);
      const post = await Post.query().where('id', post_id).preload('postImages').first();

      if (!isEmpty(request.files('images'))) {
        const fileDestination = 'uploads/';
        for (let image of request.files('images')) {
          const fileName = fileDestination + image.clientName;

          await image.move(fileDestination, {
            name: image.clientName
          });
          const postImage = await PostImage.create({
            'post_id': request.param('id'),
            'url': fileName
          });
        }
      }

      // this merge method will merge the attributes into the methods.
      post.merge(attributes).save();

      // const post = await Post.create(attributes);
      return returnResponse(response, true, 'posts fetched successfully.', 201, [])
      // return returnResponse('success', [post], ['posts fetched successfully.'])
    } catch (error) {
      return returnResponse(response, false, this.wrong, 500, [], error);
    }
  }

  public async destroy({ request, response }: HttpContextContract) {
    const post_id = request.param('id')
    try {
      const post = await Post.query().where('id', post_id).first();
      await post.delete()

      // const post = await Post.create(attributes);
      return returnResponse(response, true, 'posts deleted successfully.', 201, [post]);
    } catch (error) {
      return returnResponse(response, false, this.wrong, 500, [], error);
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
      return returnResponse(response, true, 'posts sets to ' + attributes['status'] + ' successfully.', 201, []);
    } catch (error) {
      return returnResponse(response, false, this.wrong, 500, [], error);
    }
  }

  // this is common validation function of each module
  private async commonValidation(request, skipFile = false) {

    // the schema.create schema methods is default's required.
    const validation = {
      title: schema.string({ trim: true }, [
        rules.minLength(3),
      ]),
      description: schema.string({ trim: true }, [
        rules.minLength(10),
      ]),
      status: schema.enum(['active', 'inactive'], [
      ]),
    };

    if (skipFile == false || isEmpty(request.files('images'))) {

      validation['images'] = schema.array().members(schema.file({
        size: '2mb',
        extnames: ['jpg', 'gif', 'png'],
      }))
    }

    const validationSchema = schema.create(validation);
    const customMessages = {
      'title.required': 'The title field is required.',
      'title.minLength': 'The title must be at least 3 characters long.',
      'description.required': 'The description field is required.',
      'description.minLength': 'The description must be at least 10 characters long.',
      'status.required': 'The status field is required.',
      'status.enum': 'Invalid status value. Must be either "active" or "inactive".',
      'images.required': 'Images are required.',
      'file.size': 'Image size should be max 2mb.',
      'file.extnames': 'Image should be the type of jpg,gif,png.',
    };

    return await request.validate({
      schema: validationSchema,
      messages: customMessages
    });
  }
}
