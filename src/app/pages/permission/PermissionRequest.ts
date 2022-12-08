export class PermissionRequest {
    public userId : number;
    public appId : number;
    public permissions : string[];

    constructor(userId : number, appId : number, permissions : string[]) {
        this.userId = userId; 
        this.appId = appId; 
        this.permissions = permissions; 
    }
}