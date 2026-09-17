// app/shared/types/report-type.ts — Local report response entity.
//
// There is no spec response model for reports (the SDK declares the report
// endpoints as `customInstance<void>`), so — same class as `PostType` — the
// read shape lives here. This is NOT a request DTO duplicate: request
// payloads keep using the canonical `ReportPostRequest` model. Every field
// except `id` stays optional because the wire shape is undocumented; the
// facade casts the envelope `data` into this type.
export interface ReportType {
    id: string;
    postId?: string;
    reason?: string;
    details?: string | null;
    status?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
