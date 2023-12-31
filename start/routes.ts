/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { welcome: 'Welcome to adonis project have a great day.' }
})

Route.group(() => {

  Route.post('/login', 'AuthController.login')
  Route.post('/register', 'AuthController.register')

  Route.group(() => {

    // loged in user profile
    Route.resource('profile', 'ProfilesController').only(['store', 'destroy', 'index'])
    Route.post('profile/logout', 'ProfilesController.logout')

    // posts
    Route.resource('posts', 'PostsController').apiOnly();
    Route.post('posts/:id/status', 'PostsController.setStatus');
  }).middleware('customAuth')
}).prefix('/api');
