import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Post from 'App/Models/Post';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import PostImage from 'App/Models/PostImage';
import { isEmpty, returnResponse, fileUploads } from 'App/Helpers/Helper';
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
      return returnResponse(response, true, 'posts fetched successfully.', 200, await this.postResource.collection(posts));
    } catch (error) {
      return returnResponse(response, false, this.wrong, 500, [], error);
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      // checked the validation if fails directly goes in catch.
      const attributes = await this.commonValidation(request);

      // deleting images key from attributes
      delete attributes['images']
      const post = await Post.create(attributes);

      for (let image of request.files('images')) {
        await PostImage.create({
          'post_id': post.id,
          'url': await fileUploads(image)
        });
      }
      // this method will load latest relationship datas.
      await post.load('postImages')
      return returnResponse(response, true, 'posts added successfully.', 201, await this.postResource.resource(post));
    } catch (error) {
      console.error(error);
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

      if (isEmpty(post)) {
        return returnResponse(response, false, 'Requested post not found.', 500, []);
      }
      if (!isEmpty(request.files('images'))) {
        for (let image of request.files('images')) {
          const postImage = await PostImage.create({
            'post_id': request.param('id'),
            'url': await fileUploads(image)
          });
        }
      }

      // this merge method will merge the attributes into the methods.
      post.merge(attributes).save();
      // this method will load latest relationship datas.
      await post.load('postImages')

      return returnResponse(response, true, 'posts added successfully.', 201, await this.postResource.resource(post));
    } catch (error) {
      return returnResponse(response, false, this.wrong, 500, [], error);
    }
  }

  public async destroy({ request, response }: HttpContextContract) {
    const post_id = request.param('id')
    try {
      const post = await Post.query().where('id', post_id).preload('postImages').first();
      if (isEmpty(post)) {
        return returnResponse(response, false, 'Requested post not found.', 500, []);
      }

      await post.delete()
      return returnResponse(response, true, 'posts deleted successfully.', 201, await this.postResource.resource(post));
    } catch (error) {
      return returnResponse(response, false, this.wrong, 500, [], error);
    }
  }

  public async setStatus({ request, response }: HttpContextContract) {
    try {
      const post_id = request.param('id')
      const post = await Post.query().where('id', post_id).first();

      if (isEmpty(post)) {
        return returnResponse(response, false, 'Requested post not found.', 500, []);
      }

      const attributes = { 'status': 'active' };

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
