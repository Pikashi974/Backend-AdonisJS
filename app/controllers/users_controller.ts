import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { unlinkSync } from 'node:fs'

export default class UsersController {
  async profile({ auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const { password, enabled, isAdmin, ...userInfo } = user.$attributes
    return response.ok(userInfo)
  }
  async list() {
    const users = await User.findManyBy({ isadmin: false, enabled: true })
    let userResponse: any[] = []
    users.forEach((user) => {
      const { password, enabled, isAdmin, ...userInfo } = user.$attributes
      userResponse.push(userInfo)
    })
    return userResponse
  }
  async listAdmin() {
    const users = await User.findManyBy({ isadmin: false })
    let userResponse: any[] = []
    users.forEach((user) => {
      const { password, isAdmin, ...userInfo } = user.$attributes
      userResponse.push(userInfo)
    })
    return userResponse
  }
  async getUser({ params, response }: HttpContext) {
    const user = await User.findByOrFail('id', params.id)
    const { password, isAdmin, ...userInfo } = user.$attributes
    return response.ok(userInfo)
  }

  async patchProfile({ auth, request, response }: HttpContext) {
    const user = await auth.authenticate()
    const { fullname, email, area, tel, job } = request.all()
    if (!fullname && !email && !area && !tel && !job) {
      return response.badRequest({ message: 'All fields are required' })
    }
    await user
      .merge({
        fullname: fullname ? fullname : user.fullname,
        email: email ? email : user.email,
        area: area ? area : user.area,
        tel: tel ? tel : user.tel,
        job: job ? job : user.job,
      })
      .save()
    const { password, enabled, isAdmin, ...userInfo } = user.$attributes
    return response.ok(userInfo)
  }
  async changeImage({ auth, request, response }: HttpContext) {
    const user = await auth.authenticate()

    const img = request.file('img', {
      extnames: ['jpg', 'png', 'jpeg'],
      size: '4mb',
    })

    //Check if the image is valid
    if (!img || !img.isValid) {
      return response.badRequest({ message: 'Invalid image' })
    }

    const filename = `${cuid()}.${img.extname}`
    await img.move('public/uploads', { name: filename })
    unlinkSync(`public/uploads/${user.img}`)

    await user
      .merge({
        img: filename ? filename : user.img,
      })
      .save()
    const { password, enabled, isAdmin, ...userInfo } = user.$attributes
    return response.ok(userInfo)
  }
  async changePassword({ auth, request, response }: HttpContext) {
    const user = await auth.authenticate()
    const newPassword = request.input('password')
    const isPasswordValid = await hash.verify(user.password, newPassword)
    // Check si le mot de passe est juste le même
    if (isPasswordValid) {
      return response.badRequest({ message: 'Invalid password' })
    }
    await user
      .merge({
        password: newPassword,
      })
      .save()
    const { password, enabled, isAdmin, ...userInfo } = user.$attributes
    return response.ok(userInfo)
  }
}
