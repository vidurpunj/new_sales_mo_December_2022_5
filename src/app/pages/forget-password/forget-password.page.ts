import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
})
export class ForgetPasswordPage implements OnInit {
  user: any;

  constructor(public formBuilder: FormBuilder) {

  }


  ngOnInit(): void {
    this.user = this.formBuilder.group({
      username: new FormControl('', [Validators.required, Validators.pattern("[7-9][0-9]{9}")]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&+*()=])(?!.*\\s)[A-Za-z\\d][A-Za-z\\d!@#$%^&*()_+]{7,}")]),
      confirmation_password: new FormControl('', [Validators.required, Validators.minLength(8)])
    })
  }

  get username() {
    return this.user.get('username');
  }

  get password() {
    return this.user.get('password');
  }

  forgotPasswordService(userdata) {

  }

  goToLogin() {

  }
}
