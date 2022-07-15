import { Injectable, Next, Req, Res, Session } from '@nestjs/common';
import { FetchService } from 'src/fetch/fetch.service';
import { GRAPH_ME_ENDPOINT } from '../auth/authConfig';

@Injectable()
export class UsersService {
  constructor(private readonly fetchService: FetchService) {}

  // 認証状態を確認するためのカスタムミドルウェア
  isAuthenticated(
    @Res() res,
    @Next() next,
    @Session() session: Record<string, any>,
  ) {
    if (!session.isAuthenticated) {
      return res.redirect('/auth/signin');
    }
    next();
  }

  getUserAuth(@Res() res, @Session() session: Record<string, any>) {
    this.isAuthenticated;
    const hbsName: string = 'id';
    res.render(hbsName, {
      idTokenClaims: session.account.idTokenClaims,
    });
  }

  async getFetchUserAuth(
    @Res() res,
    @Next() next,
    @Session() session: Record<string, any>,
  ) {
    try {
      this.isAuthenticated;
      const graphResponse: any = await this.fetchService.getFetch(
        GRAPH_ME_ENDPOINT,
        session.accessToken,
      );
      res.render('profile', { profile: graphResponse });
    } catch (error) {
      next(error);
    }
  }
}
