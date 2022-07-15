import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FetchService {
  async getFetch(endpoint: string, accessToken: any) {
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    console.log(`request made to ${endpoint} at: ` + new Date().toString());

    try {
      const response = await axios.get(endpoint, options);
      return await response.data;
    } catch (error) {
      throw new Error(error);
    }
  }
}
