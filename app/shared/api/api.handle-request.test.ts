import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { handleRequest } from "./api.handle-request.js";

const envelope = { success: true, message: "OK", data: { id: "p-1" } };

describe("handleRequest", () => {
    it("unwraps AxiosResponse (.data is the envelope)", async () => {
        const axiosResponse = { data: envelope, status: 200, statusText: "OK", headers: {}, config: {} };
        assert.deepEqual(await handleRequest(Promise.resolve(axiosResponse)), envelope);
    });

    it("passes SDK-unwrapped envelopes through untouched (no double-unwrap)", async () => {
        // customInstance already stripped axios, so the promise resolves to the envelope.
        // Before the fix this returned `envelope.data` and callers lost `.success`.
        const out = await handleRequest(Promise.resolve(envelope));
        assert.deepEqual(out, envelope);
        assert.equal(out.success, true);
    });

    it("returns the server envelope from error responses", async () => {
        const serverError = { success: false, message: "Nope", data: null };
        const failing = Promise.reject({ response: { data: serverError } });
        assert.deepEqual(await handleRequest(failing), serverError);
    });

    it("throws when there is no server response (network failure)", async () => {
        await assert.rejects(() => handleRequest(Promise.reject(new Error("down"))), /down/);
    });
});
