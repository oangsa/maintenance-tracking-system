import type { IUser } from "./user.types";

export interface ILoginRequest
{
    email: string;
    password: string;
}

export interface ILoginResponse
{
    accessToken: string;
    user: IUser;
}

export interface IRefreshResponse
{
    accessToken: string;
}

export interface IMessageResponse
{
    message: string;
}
