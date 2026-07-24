export const users = [
  { login: 'inspector', password: '1234', name: 'Даулет', role: 'inspector' },
  { login: 'master', password: '1234', name: 'Ержан', role: 'master' },
]

export function findUser(login, password) {
  return users.find((u) => u.login === login && u.password === password) || null
}
