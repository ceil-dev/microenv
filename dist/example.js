"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const myEnv = (0, _1.microEnv)({
        propA: 1,
        propB: 'two',
        propC: (payload, caller) => {
            return { message: `Hello ${payload}`, caller };
        },
    }, { id: 'myEnv' });
    console.log('myEnv propA value:', myEnv.get('propA'));
    (() => __awaiter(void 0, void 0, void 0, function* () {
        console.log('myEnv new propB value:', yield myEnv.get('propB', 'someCallerId', true));
    }))().catch(console.warn);
    console.log('myEnv propC call result:', myEnv.face.propC('World'));
    setTimeout(() => {
        myEnv.face.propB = 68;
    }, 2000);
});
run().catch(console.warn);
//# sourceMappingURL=example.js.map