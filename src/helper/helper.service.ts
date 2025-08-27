import { Injectable } from "@nestjs/common";
import { GeneralExeption } from "src/core/exception/general.exception";
import type { CoreRequest } from "src/core/request/core.request";

@Injectable()
export class HelperService {
    getToken(req: CoreRequest) {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new GeneralExeption('Authentication fail - no token');
        }

        // Bearer token
        return authHeader.split(' ')[1];
    }
}