import { ServiceAddons, Params } from "@feathersjs/feathers";
import { AuthenticationService, JWTStrategy } from "@feathersjs/authentication";
import { LocalStrategy } from "@feathersjs/authentication-local";
import {
  expressOauth,
  OAuthStrategy,
  OAuthProfile,
} from "@feathersjs/authentication-oauth";

import { Application } from "./declarations";

declare module "./declarations" {
  interface ServiceTypes {
    authentication: AuthenticationService & ServiceAddons<any>;
  }
}

class GitHubStrategy extends OAuthStrategy {
  async getEntityData(profile: OAuthProfile, existing: any, params: Params) {
    const baseData = await super.getEntityData(profile, existing, params);

    // If the user already exists i don't rewrite informations
    // Informations are now dependant from the application
    // So i keep name / avatar / email as there could have been updated at some point
    // by the user
    return {
      ...baseData,
      // You can also set the display name to profile.name
      name: existing && existing.name ? existing.name : profile.login,
      // The GitHub profile image
      avatar:
        existing && existing.avatar ? existing.avatar : profile.avatar_url,
      // The user email address (if available)
      email: existing && existing.email ? existing.email : profile.email,
    };
  }
}

export default function (app: Application): void {
  const authentication = new AuthenticationService(app);

  authentication.register("jwt", new JWTStrategy());
  authentication.register("local", new LocalStrategy());
  authentication.register("github", new GitHubStrategy());

  app.use("/authentication", authentication);
  app.configure(expressOauth());
}
