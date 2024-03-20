import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

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
  async patchProfile({ auth, request, response }: HttpContext) {
    const user = await auth.authenticate()
    const { fullname, email, area, tel, job } = request.all()
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
}
