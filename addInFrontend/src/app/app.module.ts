import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { LoginComponent } from './pages/login/login.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PreferencesComponent } from './pages/preferences/preferences.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CmsapiService } from './services/cmsapi.service';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { OutlookService } from './services/outlook.service';
import { ErrmessagesService } from './services/errmessages.service';
import { MessagesComponent } from './shared/messages/messages.component';
import { AuthService } from './services/auth.service';
import { SelectsiteComponent } from './pages/selectsite/selectsite.component';
import { CuiTabsModule } from '@cisco-ngx/cui-components';
import { UserHeaderComponent } from './pages/preferences/user-header/user-header.component';
import { SelectSpaceComponent } from './pages/preferences/select-space/select-space.component';
import { NewSpaceComponent } from './pages/preferences/new-space/new-space.component';


@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    LoginComponent,
    PreferencesComponent,
    MessagesComponent,
    SelectsiteComponent,
    UserHeaderComponent,
    SelectSpaceComponent,
    NewSpaceComponent,
    // CommandsComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CuiTabsModule,
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
