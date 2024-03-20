import Job from '#models/job'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    try {
      const email = request.input('email')
      const password = request.input('password')
      const fullname = request.input('fullname')
      const area = request.input('area')
      const tel = request.input('tel')
      const job = request.input('job')

      // Check if every fields are filled
      if (!email || !password || !fullname || !area || !tel || !job) {
        return response.badRequest({ message: 'All fields are required' })
      }

      // Check if the email is already registered
      const userExist = await User.findBy('email', email)
      if (userExist) {
        return response.badRequest({ message: 'Email already registered' })
      }

      // check if job exist
      const jobExist = await Job.findBy('id', job)
      if (!jobExist) {
        return response.badRequest({ message: 'Job not found' })
      }

      const img = request.file('img', {
        extnames: ['jpg', 'png', 'jpeg'],
        size: '4mb',
      })

      //Check if the image is valid
      if (!img || !img.isValid) {
        return response.badRequest({ message: 'Invalid image' })
      }

      const filename = `${cuid()}.${img.extname}`

      // Create the user
      const user = await User.create({
        email: email,
        password: password,
        fullname: fullname,
        area: area,
        tel: tel,
        img: filename,
        job: jobExist.id,
      })

      await user.save()
      await img.move('public/uploads', { name: filename })

      return response.created({ message: 'User created' })
    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during registration' })
    }
  }

  async login({ request, response }: HttpContext) {
    try {
      // const email = request.input('email')
      // const password = request.input('password')
      const { email, password } = request.all()
      if (!email || !password) {
        return response.badRequest({ message: 'All fields are required' })
      }

      const user = await User.findBy('email', email)
      if (!user) {
        return response.badRequest({ message: 'User not found' })
      }

      const isPasswordValid = await hash.verify(user.password, password)
      if (!isPasswordValid) {
        return response.badRequest({ message: 'Invalid password' })
      }
      if (!user.enabled) {
        return response.unauthorized({ error: 'Your account is not verified' })
      }

      const token = await User.accessTokens.create(user)

      return response.ok({ message: 'Logged in', token: token.toJSON().token })
    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during login' })
    }
  }
  async logout({ auth, response }: HttpContext) {
    try {
      User.accessTokens.delete(
        auth.user as User,
        auth.user?.currentAccessToken?.identifier as string
      )
      return response.ok({ message: 'Logged out' })
    } catch (error) {
      console.log(error)
      return response.internalServerError({ message: 'An error occured during logout' })
    }
  }
}
