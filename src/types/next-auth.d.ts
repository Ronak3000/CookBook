import 'next-auth'

declare module 'next-auth' {
    interface User{
        _id?: String;
        isVerified?: boolean;
        isAcceptingMessage?: boolean;
        username?: string
    }
    interface Session{
        user:{
            _id?: String;
            isVerified?: boolean;
            isAcceptingMessage?: boolean;
            username?: string
        } & DefaultSession['user']
    }

    interface JWT{
        _id?: String;
        isVerified?: boolean;
        isAcceptingMessage?: boolean;
        username?: string
    }
}