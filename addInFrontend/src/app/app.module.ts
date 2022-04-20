import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { LoginComponent } from './pages/login/login.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PreferencesComponent } from './pages/preferences/preferences.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { CmsapiService } from './services/cmsapi.service';
import { ButtonComponent } from './shared/button/button.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { OutlookService } from './services/outlook.service';
import { ErrmessagesService } from './services/errmessages.service';
import { MessagesComponent } from './shared/messages/messages.component';
import { AuthService } from './services/auth.service';


@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    LoginComponent,
    PreferencesComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
    MessagesComponent,
    // CommandsComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthService,
    CmsapiService,
    OutlookService,
    ErrmessagesService,
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthInterceptorService,
    //   multi: true
    // },
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
