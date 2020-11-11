import {
  AuthenticationClient as BaseAuthenticationClient,
  AuthenticationClientOptions,
} from "authing-js-sdk";
import { encryptFunction } from "./encrypt";
import { GraphqlClient } from "./GraphqlClient";
import { HttpClient } from "./HttpClient";

export class AuthenticationClient extends BaseAuthenticationClient {
  constructor(options: AuthenticationClientOptions) {
    options.encryptFunction = encryptFunction;
    options.httpClient = HttpClient;
    options.graphqlClient = GraphqlClient;
    super(options);
  }
}
