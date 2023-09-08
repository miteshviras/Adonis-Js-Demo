import { isEmpty, getFilePath } from 'App/Helpers/Helper';
import Post from "App/Models/Post"

export default class PostResource {

  public async resource(array: Post) {
    let images = {};

    if (!isEmpty(array.postImages)) {
      images = await Promise.all(array.postImages.map(async (image) => {
        return {
          id: image.id,
          post_id: image.post_id,
          url: await getFilePath(image.url)
        }
      }));
    }

    return {
      id: array.id,
      title: array.title,
      description: array.description,
      status: array.status,
      images: images
    };

  }

  public async collection(array: Post) {
    const resource = await Promise.all(array.map(
      async (post) => {
        let images = {};

        if (!isEmpty(post.postImages)) {
          images = await Promise.all(post.postImages.map(async (image) => {
            return {
              id: image.id,
              post_id: image.post_id,
              url: await getFilePath(image.url)
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
