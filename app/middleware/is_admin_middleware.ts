import { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class IsAdminMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })
    let isAdmin = await ctx.auth.user?.$extras.isAdmin
    console.log(isAdmin)

    if (isAdmin) {
      return next()
    } else {
      return ctx.response.unauthorized({
        message: 'You are not authorized to perform this action',
      })
    }
  }
}
