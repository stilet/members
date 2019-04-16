import bcrypt from 'bcryptjs'
import gql from 'graphql-tag'

import { createToken, serverToken, createRefreshToken } from 'src/lib/jwt'
import { url, token, role, gqlQuery } from 'src/stores/graphql'

const {
  GRAPHQL_LOCAL_URI = 'http://members-graphql-1.dev.dock/v1alpha1/graphql',
  COOKIE_DOMAIN = 'dev.dock',
  COOKIE_SECURE = false
} = process.env

url.set(GRAPHQL_LOCAL_URI)

export async function post (req, res) {

  token.set(serverToken('server:login', 'server'))
  role.set('server')

  try {
    const result = await gqlQuery({
      query: gql`
        query($email: String) {
          active_member(where:{email:{_eq:$email}}) {
            id name email password
            member_roles {
              role {
                name
              }
            }
          }
        }
      `,
      variables: {
        email: req.body.email
      }
    })
    console.log("Got result:", req.body, result)
    const { active_member: [member ] } = result.data

    if (member) {
      const passwordOk = await bcrypt.compare(req.body.password, member.password)

      if (passwordOk) {
        const token = createToken(member)
        const refreshToken = createRefreshToken(member.id)

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Set-Cookie': `token=${
                          token
                        }; Domain=${
                          COOKIE_DOMAIN
                        }; Path=/; ${
                          (COOKIE_SECURE === 'true') ? 'Secure;' : ''
                        }  HttpOnly`
        })
        res.end(JSON.stringify({
          token,
          refreshToken,
          user: {
            id: member.id,
            email: member.email,
            name: member.name,
            roles: member.member_roles.map(mr => mr.role.name)
          }
        }))
        return
      }
    }
    res.writeHead(401, {
      'Content-Type': 'application/json'
    })
    res.end(JSON.stringify({
      error: 'Authentication failed'
    }))
  } catch (e) {
    console.error('Error logging in', e)
    res.writeHead(500, {
      'Content-Type': 'application/json'
    })
    res.end(JSON.stringify({
      error: e.toString()
    }))
  }
}
