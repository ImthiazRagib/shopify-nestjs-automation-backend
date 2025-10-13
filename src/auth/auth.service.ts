import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {

    async login() {
        return 'login';
    }

    async create() {
        return 'register';
    }

}
