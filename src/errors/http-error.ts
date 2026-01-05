export class HttpError extends Error{
    statuCode: number;
    constructor(statusCode: number, message:string){
        super(message);
        this.statuCode = statusCode;
    }
}