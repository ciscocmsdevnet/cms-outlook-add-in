
export interface User {
     email: string,
     token: string,
     webbridge: string
}

export interface AuthResponseData {
     jwt: string
     idToken: string
}
