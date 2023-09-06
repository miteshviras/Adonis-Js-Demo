import { isEmpty } from 'App/Helpers/Helper';
import Post from "App/Models/Post"
import Drive from '@ioc:Adonis/Core/Drive'

export default class PostResource {

  public async resource(array: Post) {
    const resource = await Promise.all(array.map(
      async (post) => {
        let images = {};

        if (!isEmpty(post.postImages)) {
          images = await Promise.all(post.postImages.map(async (image) => {
            const url = await Drive.get(image.url);
            return {
              id: image.id,
              post_id: image.post_id,
              url: url
            }
          }));
        }

        return {
          id: post.id,
          title: post.title,
          description: post.description,
          status: post.status,
          images: images
        };
      }
    ));

    return resource
  }

}
