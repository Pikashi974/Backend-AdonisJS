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
    router.patch('/profile/password', '#controllers/users_controller.changePassword')
  })
  .use(middleware.auth({ guards: ['api'] }))
router
  .group(() => {
    router.get('/users', '#controllers/users_controller.listAdmin')
    router.get('/user/:id', '#controllers/users_controller.getUser')
    router.patch('/user/:id', '#controllers/users_controller.patchProfileUser')
    router.patch('/user/:id/img', '#controllers/users_controller.changeImageUser')
    router.patch('/user/:id/password', '#controllers/users_controller.changePasswordUser')
    router.delete('/user/:id', '#controllers/users_controller.deleteUser')
    router.post('/user/:id/enabled', '#controllers/users_controller.enableUser')
  })
  .prefix('/admin')
  .use(middleware.admin({ guards: ['api'] }))
