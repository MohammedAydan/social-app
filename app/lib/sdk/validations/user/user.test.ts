import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    GetApiUserSearchQueryParams,
    PostApiUserChangePasswordBody,
    PostApiUserForgetPasswordBody,
    PostApiUserRegisterBody,
    PostApiUserResetPasswordBody,
    PostApiUserSignInBody,
    PutApiUserUpdateUserBody,
} from "./user.js";

/**
 * Generated Zod bodies are the source of truth for the User wire shapes.
 * `birthDate` is an ISO datetime with offset — callers serialize `Date`
 * before calling (register-page, update-user-dialog, use-update-profile-image).
 */
describe("PostApiUserRegisterBody", () => {
    it("accepts the canonical shape with ISO birthDate", () => {
        assert.deepEqual(
            PostApiUserRegisterBody.parse({
                firstName: "Ahmed",
                lastName: "Ali",
                userName: "ahmed",
                userGender: "male",
                email: "a@x.com",
                password: "Secret1!",
                birthDate: new Date("2000-01-01").toISOString(),
                bio: "Hi",
            }).userName,
            "ahmed"
        );
    });

    it("rejects Date instances and non-datetime strings for birthDate", () => {
        const base = {
            firstName: "A",
            lastName: "B",
            userName: "ab",
            userGender: "male",
            email: "a@x.com",
            password: "Secret1!",
            bio: "Hi",
        };
        assert.throws(() => PostApiUserRegisterBody.parse({ ...base, birthDate: new Date() }));
        assert.throws(() => PostApiUserRegisterBody.parse({ ...base, birthDate: "not-a-date" }));
    });
});

describe("PostApiUserSignInBody", () => {
    it("accepts the canonical { email, password } pair", () => {
        assert.deepEqual(
            PostApiUserSignInBody.parse({ email: "a@x.com", password: "Secret1!" }),
            { email: "a@x.com", password: "Secret1!" }
        );
    });
});

describe("PutApiUserUpdateUserBody", () => {
    it("accepts partial updates and strips unknown keys (userGender)", () => {
        assert.deepEqual(
            PutApiUserUpdateUserBody.parse({ firstName: "Sara", userGender: "female" }),
            { firstName: "Sara" }
        );
    });
});

describe("Password bodies", () => {
    it("accepts change/forget shapes", () => {
        assert.deepEqual(
            PostApiUserChangePasswordBody.parse({
                currentPassword: "a",
                newPassword: "b",
                confirmPassword: "b",
            }).currentPassword,
            "a"
        );
        assert.deepEqual(PostApiUserForgetPasswordBody.parse({ email: "a@x.com" }), {
            email: "a@x.com",
        });
    });

    it("enforces the reset-password strength policy", () => {
        const base = { email: "a@x.com", token: "t", confirmPassword: "Secret1!" };
        assert.deepEqual(
            PostApiUserResetPasswordBody.parse({ ...base, password: "Secret1!" }).password,
            "Secret1!"
        );
        assert.throws(() => PostApiUserResetPasswordBody.parse({ ...base, password: "weak" }));
    });
});

describe("GetApiUserSearchQueryParams", () => {
    it("defaults to page 1 / limit 20 with optional q/userId", () => {
        assert.deepEqual(GetApiUserSearchQueryParams.parse({}), { page: 1, limit: 20 });
        assert.deepEqual(GetApiUserSearchQueryParams.parse({ q: "ahm", page: 2 }), {
            q: "ahm",
            page: 2,
            limit: 20,
        });
    });
});
