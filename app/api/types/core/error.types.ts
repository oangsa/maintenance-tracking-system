export interface IApiErrorBody
{
    statusCode: number;
    message: string;
    error: string;
    stack?: string | null;
}
