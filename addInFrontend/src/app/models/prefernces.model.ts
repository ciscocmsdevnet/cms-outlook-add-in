
export interface Preferences {
     defaultspaceGUID: string,
     defaultaccessmethodGUID: string,
}

export interface Space {
     guid: string,
     name: string,
     uri: string
}

export interface SpaceTemplate {
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
