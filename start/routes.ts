/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
router.get('/', async () => {
  return { hello: 'world' }
})
router.post('/register', '#controllers/auth_controller.register')
router.post('/login', '#controllers/auth_controller.login')

router
  .group(() => {
    router.post('/logout', '#controllers/auth_controller.logout')
    router.get('/profile', '#controllers/users_controller.profile')
    router.get('/users', '#controllers/users_controller.list')
    router.patch('/profile', '#controllers/users_controller.patchProfile')
    router.patch('/profile/img', '#controllers/users_controller.changeImage')
  })
  .use(middleware.auth({ guards: ['api'] }))
