import { Component, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);
  private title = inject(Title);

  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.title.setTitle('BSR Solutions - Distributor Portal Login');
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid || this.loading()) return;
    this.errorMessage.set('');
    this.loading.set(true);
    const { username, password } = this.loginForm.value;
    try {
      const result = await this.api.login(username, password, 'xml').toPromise() as any;
      if (result?.status === 'success') {
        this.auth.saveSession(result.user, result.token, 'xml');
        this.router.navigate(['/dashboard']);
      } else if (result?.status === 'session_conflict') {
        if (confirm(result.message + '\n\nForce sign in?')) {
          const forceResult = await this.api.login(username, password, 'xml', true).toPromise() as any;
          if (forceResult?.status === 'success') {
            this.auth.saveSession(forceResult.user, forceResult.token, 'xml');
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage.set(forceResult?.message || 'Login failed.');
          }
        }
      } else {
        this.errorMessage.set(result?.message || 'Invalid credentials.');
      }
    } catch (err: any) {
      this.errorMessage.set('Authentication service unavailable. Please check server.');
    } finally {
      this.loading.set(false);
    }
  }
}
