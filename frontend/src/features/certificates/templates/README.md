# Certificate Templates

## Purpose

This directory contains one subfolder per certificate type. Each subfolder will hold the template files needed by the PDF/DOCX generation module when it is implemented.

## Status: 🔴 NOT IMPLEMENTED

PDF and DOCX generation has **not been implemented yet**. This folder structure is scaffolded so the implementing developer has a clear location to work in.

## How to Implement a Certificate Generator

### Frontend (this repo)

Each template subfolder should contain:
- `preview.tsx` — A React component that renders the certificate as HTML (for print preview)
- `schema.ts` — Any additional Zod fields specific to this certificate type

### Backend (NestJS repo)

Each certificate type has a corresponding generator class in:
```
src/modules/certificates/generators/<certificate-type>.generator.ts
```

All generators extend `BaseCertificateGenerator` and implement:
```typescript
abstract generate(data: CertificateData): Promise<Buffer>
abstract getFormat(): 'PDF' | 'DOCX'
```

The `CertificatesService` routes to the correct generator via a registry map:
```typescript
private readonly generators = new Map<CertificateType, BaseCertificateGenerator>([
  [CertificateType.BARANGAY_CLEARANCE, this.barangayClearanceGenerator],
  [CertificateType.OATH_OF_UNDERTAKING, this.oathGenerator],
  // ... add new types here
])
```

## Adding a New Certificate Type

1. Add a new value to `CertificateType` enum in `src/features/certificates/types/certificate.types.ts`
2. Add the human-readable label to `CERTIFICATE_TYPE_LABELS`
3. Create a subfolder here: `templates/<new-type-slug>/`
4. On the backend: create `<new-type>.generator.ts` extending `BaseCertificateGenerator`
5. Register the new generator in the `CertificatesModule` providers and the generator map

## Certificate Types

| Type | Folder | Status |
|------|--------|--------|
| Barangay Clearance | `barangay-clearance/` | ⏳ Pending |
| Oath of Undertaking | `oath-of-undertaking/` | ⏳ Pending |
| Application for Barangay Clearance | `application-barangay-clearance/` | ⏳ Pending |
| Certification Slip | `certification-slip/` | ⏳ Pending |
| Certification of Indigency | `certification-of-indigency/` | ⏳ Pending |
| Certification for Financial Assistance | `certification-financial-assistance/` | ⏳ Pending |
| Certification for First Time Jobseekers Act of 2019 | `certification-first-time-jobseeker/` | ⏳ Pending |
| Certification of Guardianship | `certification-of-guardianship/` | ⏳ Pending |
| Certification of Good Moral | `certification-good-moral/` | ⏳ Pending |
