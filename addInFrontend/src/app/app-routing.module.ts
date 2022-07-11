import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { PreferencesComponent } from './pages/preferences/preferences.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { AuthGuard } from './pages/login/auth.guard';
import { CommandsComponent } from './pages/commands/commands.component';
import { SelectsiteComponent } from './pages/selectsite/selectsite.component';


const routes: Routes = [
  {
    path: "",
    component: WelcomeComponent,
  },
  {
    path: 'selectsite',
    component: SelectsiteComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'preferences',
    component: PreferencesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'commands',
    component: CommandsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
