/** Shared display-name helpers: show "First Last" with @username as handle. */
const clean = (value) => typeof value === "string" ? value.trim() : "";
/** "First Last", falling back to username, then "Unknown User". */
export const getDisplayName = (user) => {
    if (!user)
        return "Unknown User";
    const full = `${clean(user.firstName)} ${clean(user.lastName)}`.trim().replace(/\s+/g, " ");
    if (full)
        return full;
    const handle = clean(user.userName);
    return handle || "Unknown User";
};
/** "@username", or null when there is no username. */
export const getHandle = (user) => {
    const handle = user ? clean(user.userName) : "";
    return handle ? `@${handle}` : null;
};
/** Up to 2 uppercase initials from the display name ("Mary Jane" → "MJ"). */
export const getInitials = (user) => {
    const name = typeof user === "string" ? user.trim() : getDisplayName(user ?? undefined);
    if (!name || name === "Unknown User")
        return "";
    const parts = name.split(/\s+/);
    if (parts.length === 1)
        return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
/** Exact placeholder the API returns for deleted ancestors (ARCHITECTURE.md §2.1). */
export const DELETED_CONTENT_PLACEHOLDER = "[This content has been deleted]";
export const isDeletedPlaceholder = (content) => typeof content === "string" && content.trim() === DELETED_CONTENT_PLACEHOLDER;
