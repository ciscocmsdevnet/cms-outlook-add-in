
export interface Preferences {
     defaultspace: Space,
     defaultaccessmethod: AccessMethod,
}

export interface Space {
     guid: string,
     name: string,
     uri: string
}

export interface Template {
     id: string,
     name: string
}

export interface AccessMethod {
     guid: string,
     name: string,
     uri: string
}

export interface AccessMethodResponse{
     accessMethods: AccessMethod[]
}

export interface InvitationResponse{
     invitation: string  
     language: string
}
