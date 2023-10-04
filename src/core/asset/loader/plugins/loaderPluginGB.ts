var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Cache, gbToOdieParser } from '@goodboydigital/odie';
import { extname } from 'path';
import { makeAbsoluteUrl } from '../../../../utils';
import { CentralDispatch } from '../../../central-dispatch/CentralDispatch';
const loaderPluginGB = {
    test(url) {
        return (extname(url).includes('.gb'));
    },
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const absolutePath = makeAbsoluteUrl(url);
            const gbObject = yield CentralDispatch.loadGB(absolutePath);
            const scene = gbToOdieParser(gbObject);
            const tempURL = url.split('?')[0];
            Cache.add(tempURL, scene);
            return scene;
        });
    },
};
export { loaderPluginGB };
//# sourceMappingURL=loaderPluginGB.js.map