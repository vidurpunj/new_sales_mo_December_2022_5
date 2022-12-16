import {Injectable} from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from "@angular/common/http";
import {Observable} from "rxjs";
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  constructor(public http: HttpClient) {
    console.log('Hello InterceptorProvider Provider');
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log("----------------Start RequestResponse Interceptor ---------------");
    console.log('current request without headers ->', request);

    // if(!request.url.endsWith("login") && !request.url.endsWith("logout") && !request.url.endsWith("forgotPassword")
    //   && !request.url.endsWith("sendOtp") && !request.url.endsWith("otpValidation"))
    if (!request.url.endsWith("authenticate") && !request.url.endsWith("logout") && !request.urlWithParams.endsWith("validatePermissions")
      && !request.url.endsWith("generateOTP") && !request.url.endsWith("verifyOTP")
      && !request.url.endsWith("requestForDeviceRegister") && !request.url.endsWith("completeDeviceRegister")
      && !request.url.endsWith("changeOrResetPassword") && !request.url.endsWith("validateUserAndPassword")
      && !request.url.endsWith("generateToken") && !request.url.endsWith("deleteToken")) {
      console.log("----------------Inside RequestResponse Interceptor---------------");
      // @ts-ignore
      // @ts-ignore
      // @ts-ignore
      const headers = new HttpHeaders({
        // "Content-Type":"application/json",
        // "responseType": "json",
        "emp_id": `window.localStorage.getItem('userid')`,
        "org_id": `window.localStorage.getItem('org_id')`,
        "token": `window.localStorage.getItem('token')`,
        "device_id": `window.localStorage.getItem('device_id')`
      });
      request = request.clone({headers});
      console.log('new request with headers ->', request);
    }

    return next.handle(request).pipe(tap(event => {
        if (event instanceof HttpResponse) {
          console.log("all good");
          console.log('event', event);
          console.log("----------------END RequestResponse Interceptor ---------------");
        }
      }, error => {
        console.log('error block in interceptor');
        // console.log("request: ", request);
        console.error("error status code: ", error.status);
        console.error("error status message: ", error.message);
        console.log("----------------END RequestResponse Handler ---------------");
      }
    ))
  }

}
