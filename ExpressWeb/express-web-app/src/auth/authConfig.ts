/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LogLevel } from '@azure/msal-node';
import 'dotenv/config';

/**
 * MSALインスタンス生成時に渡される設定オブジェクト。
 * MSAL Nodeの設定パラメータの一覧は、こちらをご覧ください。
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
export const msalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID, // Azureポータルでのアプリ登録の「Application (client) ID」 - この値はGUIDです。
    authority: process.env.CLOUD_INSTANCE + process.env.TENANT_ID, // 完全なディレクトリのURL、形式は https://login.microsoftonline.com/<tenant>
    clientSecret: process.env.CLIENT_SECRET, // Azureポータルでのアプリ登録時に生成されたクライアントシークレット
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Verbose,
    },
  },
};

export const REDIRECT_URI = process.env.REDIRECT_URI;
export const POST_LOGOUT_REDIRECT_URI = process.env.POST_LOGOUT_REDIRECT_URI;
export const GRAPH_ME_ENDPOINT = process.env.GRAPH_API_ENDPOINT + 'v1.0/me';
