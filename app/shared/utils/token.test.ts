import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
    getAccessToken,
    getRefreshToken,
    removeAccessToken,
    removeRefreshToken,
    saveAccessToken,
    saveRefreshToken,
} from "./token.js";
import { accessTokenKey, refreshTokenKey } from "./strings.js";

/** In-memory `localStorage` stand-in (node has no DOM). */
const store = new Map<string, string>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
};

describe("token storage (auth session persistence)", () => {
    beforeEach(() => store.clear());

    it("round-trips the access token under the canonical key", () => {
        saveAccessToken("jwt-a");
        assert.equal(getAccessToken(), "jwt-a");
        assert.equal(store.get(accessTokenKey), "jwt-a");
    });

    it("round-trips the refresh token under the canonical key", () => {
        saveRefreshToken("jwt-r");
        assert.equal(getRefreshToken(), "jwt-r");
        assert.equal(store.get(refreshTokenKey), "jwt-r");
    });

    it("ignores nullish saves (never persists the string 'undefined')", () => {
        saveAccessToken(undefined);
        saveRefreshToken(undefined);
        assert.equal(getAccessToken(), null);
        assert.equal(getRefreshToken(), null);
        assert.equal(store.size, 0);
    });

    it("removes tokens independently on logout", () => {
        saveAccessToken("jwt-a");
        saveRefreshToken("jwt-r");
        removeAccessToken();
        assert.equal(getAccessToken(), null);
        assert.equal(getRefreshToken(), "jwt-r");
        removeRefreshToken();
        assert.equal(getRefreshToken(), null);
    });
});
