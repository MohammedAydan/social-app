import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getDisplayName, getHandle, getInitials } from "./display-name.js";

describe("getDisplayName", () => {
    it("prefers First Last over username", () => {
        assert.equal(
            getDisplayName({ firstName: "Ahmed", lastName: "Ali", userName: "ahmed123" }),
            "Ahmed Ali"
        );
    });
    it("falls back to username, then Unknown User", () => {
        assert.equal(getDisplayName({ userName: "ahmed123" }), "ahmed123");
        assert.equal(getDisplayName({}), "Unknown User");
        assert.equal(getDisplayName(null), "Unknown User");
        assert.equal(getDisplayName(undefined), "Unknown User");
    });
    it("trims and collapses whitespace", () => {
        assert.equal(getDisplayName({ firstName: "  Ahmed ", lastName: "  Ali " }), "Ahmed Ali");
    });
});

describe("getHandle", () => {
    it("prefixes @ and returns null without username", () => {
        assert.equal(getHandle({ userName: "ahmed123" }), "@ahmed123");
        assert.equal(getHandle({}), null);
        assert.equal(getHandle(null), null);
    });
});

describe("getInitials", () => {
    it("builds two-letter initials", () => {
        assert.equal(getInitials({ firstName: "Ahmed", lastName: "Ali" }), "AA");
        assert.equal(getInitials("Sara"), "SA");
    });
    it("returns empty for unknown users", () => {
        assert.equal(getInitials(null), "");
        assert.equal(getInitials({}), "");
    });
});
