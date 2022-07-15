import { Injectable, Next, Req, Res, Session } from '@nestjs/common';
import {
  msalConfig,
  REDIRECT_URI,
  POST_LOGOUT_REDIRECT_URI,
} from '../auth/authConfig';
import 'isomorphic-fetch';
import {
  ConfidentialClientApplication,
  CryptoProvider,
} from '@azure/msal-node';

@Injectable()
export class AuthService {
  msalInstance = new ConfidentialClientApplication(msalConfig);
  cryptoProvider = new CryptoProvider();

  async redirectToAuthCodeUrl(
    @Next() next,
    @Session() session: Record<string, any>,
    @Res() res,
    authCodeUrlRequestParams,
    authCodeRequestParams,
  ) {
    // 認可フローを開始する前にPKCEコードを生成する
    const { verifier, challenge } =
      await this.cryptoProvider.generatePkceCodes();
    // 生成されたPKCEコードとメソッドをセッションバーとして設定する。
    session.pkceCodes = {
      challengeMethod: 'S256',
      verifier: verifier,
      challenge: challenge,
    };
    /**
     * 各リクエストの前に下記のリクエストオブジェクトを操作することで
     * を、希望するクレームで認証することができます。詳細については、以下をご覧ください。
     * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationurlrequest
     * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationcoderequest
     **/
    session.authCodeUrlRequest = {
      redirectUri: REDIRECT_URI,
      responseMode: 'form_post', // コンフィデンシャルクライアントにお勧めします
      codeChallenge: session.pkceCodes.challenge,
      codeChallengeMethod: session.pkceCodes.challengeMethod,
      ...authCodeUrlRequestParams,
    };
    session.authCodeRequest = {
      redirectUri: REDIRECT_URI,
      code: '',
      ...authCodeRequestParams,
    };
    // ユーザーをサインインさせ、アプリケーションに必要なスコープに同意するためのURLを取得する
    try {
      const authCodeUrlResponse = await this.msalInstance.getAuthCodeUrl(
        session.authCodeUrlRequest,
      );
      res.redirect(authCodeUrlResponse);
    } catch (error) {
      next(error);
    }
  }

  async getSignInAuth(
    @Res() res: Response,
    @Next() next,
    @Session() session: Record<string, any>,
  ) {
    // crsfのGUIDを作成する
    session.csrfToken = this.cryptoProvider.createNewGuid();
    /**
     * MSAL Nodeライブラリでは、Requestオブジェクトのstateパラメータとして、カスタムステートを渡すことができます。
     * また、stateパラメータは、リダイレクト前のアプリの状態の情報をエンコードするために使用することができる。
     * このパラメータへの入力として、ユーザーがいたページやビューなど、アプリ内でのユーザーの状態を渡すことができます。
     */
    const state = this.cryptoProvider.base64Encode(
      JSON.stringify({
        csrfToken: session.csrfToken,
        redirectTo: '/',
      }),
    );
    const authCodeUrlRequestParams = {
      state: state,
      /**
       * デフォルトでは、MSAL Nodeは認証コードのurlリクエストにOIDCスコープを追加します。詳しくは、以下をご覧ください。
       * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
       */
      scopes: [],
    };
    const authCodeRequestParams = {
      scopes: [],
    };
    // 認証コードフローの最初のレッグを起動する
    const url = await this.redirectToAuthCodeUrl(
      next,
      session,
      res,
      authCodeUrlRequestParams,
      authCodeRequestParams,
    );
    // 認可フローを開始する前にPKCEコードを生成する
    const { verifier, challenge } =
      await this.cryptoProvider.generatePkceCodes();
    // 生成されたPKCEコードとメソッドをセッションバーとして設定する。
    session.pkceCodes = {
      challengeMethod: 'S256',
      verifier: verifier,
      challenge: challenge,
    };
    /**
     * 各リクエストの前に下記のリクエストオブジェクトを操作することで
     * を、希望するクレームで認証することができます。詳細については、以下をご覧ください。
     * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationurlrequest
     * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationcoderequest
     **/
    session.authCodeUrlRequest = {
      redirectUri: REDIRECT_URI,
      responseMode: 'form_post', // コンフィデンシャルクライアントにお勧めします
      codeChallenge: session.pkceCodes.challenge,
      codeChallengeMethod: session.pkceCodes.challengeMethod,
      ...authCodeUrlRequestParams,
    };
    session.authCodeRequest = {
      redirectUri: REDIRECT_URI,
      code: '',
      ...authCodeRequestParams,
    };
    return url;
  }

  async getAcquireTokenAuth(
    @Res() res: Response,
    @Next() next,
    @Session() session: Record<string, any>,
  ) {
    // csrfのGUIDを作成する
    session.csrfToken = this.cryptoProvider.createNewGuid();
    // 状態パラメータをエンコードする
    const state = this.cryptoProvider.base64Encode(
      JSON.stringify({
        csrfToken: session.csrfToken,
        redirectTo: '/users/profile',
      }),
    );
    const authCodeUrlRequestParams = {
      state: state,
      scopes: ['User.Read'],
    };
    const authCodeRequestParams = {
      scopes: ['User.Read'],
    };
    // trigger the first leg of auth code flow
    const url = await this.redirectToAuthCodeUrl(
      next,
      session,
      res,
      authCodeUrlRequestParams,
      authCodeRequestParams,
    );
    return url;
  }

  async postRedirectAuth(
    @Req() req,
    @Next() next,
    @Session() session: Record<string, any>,
  ) {
    if (req.body.state) {
      const state1 = JSON.parse(
        this.cryptoProvider.base64Decode(req.body.state),
      );
      // csrfToken が一致するかどうかを確認します。
      if (state1.csrfToken === session.csrfToken) {
        session.authCodeRequest.code = req.body.code; // authZコード
        session.authCodeRequest.codeVerifier = session.pkceCodes.verifier; // PKCEコードベリファイア
        try {
          const tokenResponse = await this.msalInstance.acquireTokenByCode(
            session.authCodeRequest,
          );
          session.accessToken = tokenResponse.accessToken;
          session.idToken = tokenResponse.idToken;
          session.account = tokenResponse.account;
          session.isAuthenticated = true;
          return state1.redirectTo;
        } catch (error) {
          next(error);
        }
      } else {
        next(new Error('csrf token does not match'));
      }
    } else {
      next(new Error('state is missing'));
    }
  }

  async getSignOutAuth(@Res() res, @Session() session: Record<string, any>) {
    /**
     * ログアウトURIを構築し、ユーザーを終了にリダイレクトする
     * セッションをAzure ADで行うことができます。詳細については、以下をご覧ください。
     * https://docs.microsoft.com/azure/active-directory/develop/v2-protocols-oidc#send-a-sign-out-request
     */
    const logoutUri = `${msalConfig.auth.authority}/oauth2/v2.0/logout?post_logout_redirect_uri=${POST_LOGOUT_REDIRECT_URI}`;
    session.destroy(() => {
      res.redirect(logoutUri);
    });
  }
}
