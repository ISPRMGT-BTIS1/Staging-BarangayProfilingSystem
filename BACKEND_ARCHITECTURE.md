# NestJS Backend — Architecture Reference

> This document describes the recommended **production-ready NestJS architecture** for the Barangay Profiling System backend.
> The NestJS project lives in a **separate repository** from this React frontend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | Passport.js + JWT (access + refresh tokens) |
| Validation | class-validator + class-transformer |
| Documentation | Swagger / OpenAPI |
| Testing | Jest + Supertest |

---

## Recommended Folder Structure

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── refresh-token.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       ├── update-user.dto.ts
│   │       └── change-password.dto.ts
│   │
│   ├── roles/
│   │   ├── roles.module.ts
│   │   ├── roles.controller.ts
│   │   ├── roles.service.ts
│   │   └── dto/
│   │       ├── create-role.dto.ts
│   │       └── update-role.dto.ts
│   │
│   ├── residents/
│   │   ├── residents.module.ts
│   │   ├── residents.controller.ts
│   │   ├── residents.service.ts
│   │   └── dto/
│   │       ├── create-resident.dto.ts
│   │       └── update-resident.dto.ts
│   │
│   ├── households/
│   │   ├── households.module.ts
│   │   ├── households.controller.ts
│   │   ├── households.service.ts
│   │   └── dto/
│   │       ├── create-household.dto.ts
│   │       └── update-household.dto.ts
│   │
│   ├── barangays/
│   │   ├── barangays.module.ts
│   │   ├── barangays.controller.ts
│   │   ├── barangays.service.ts
│   │   └── dto/
│   │       ├── create-barangay.dto.ts
│   │       └── update-barangay.dto.ts
│   │
│   ├── certificates/
│   │   ├── certificates.module.ts
│   │   ├── certificates.controller.ts
│   │   ├── certificates.service.ts
│   │   │
│   │   ├── enums/
│   │   │   └── certificate-type.enum.ts   ← mirrors frontend CertificateType enum
│   │   │
│   │   ├── generators/                    ← ONE FILE PER CERTIFICATE TYPE
│   │   │   ├── base-generator.ts          ← Abstract base class
│   │   │   ├── barangay-clearance.generator.ts
│   │   │   ├── oath-of-undertaking.generator.ts
│   │   │   ├── application-barangay-clearance.generator.ts
│   │   │   ├── certification-slip.generator.ts
│   │   │   ├── certification-of-indigency.generator.ts
│   │   │   ├── certification-financial-assistance.generator.ts
│   │   │   ├── certification-first-time-jobseeker.generator.ts
│   │   │   ├── certification-of-guardianship.generator.ts
│   │   │   └── certification-good-moral.generator.ts
│   │   │
│   │   └── dto/
│   │       ├── create-certificate.dto.ts
│   │       ├── approve-certificate.dto.ts
│   │       └── generate-certificate.dto.ts
│   │
│   ├── reports/
│   │   ├── reports.module.ts
│   │   ├── reports.controller.ts
│   │   ├── reports.service.ts
│   │   └── dto/
│   │       └── generate-report.dto.ts
│   │
│   ├── dashboard/
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.controller.ts
│   │   └── dashboard.service.ts
│   │
│   └── settings/
│       ├── settings.module.ts
│       ├── settings.controller.ts
│       ├── settings.service.ts
│       └── dto/
│           └── update-settings.dto.ts
│
├── common/
│   ├── decorators/
│   │   ├── roles.decorator.ts         ← @Roles('admin', 'official')
│   │   └── current-user.decorator.ts  ← @CurrentUser()
│   ├── filters/
│   │   └── http-exception.filter.ts   ← Global error handler
│   ├── interceptors/
│   │   └── transform.interceptor.ts   ← Wraps all responses in { data, statusCode }
│   └── guards/
│       └── barangay-scope.guard.ts    ← Ensures users only access their barangay's data
│
├── config/
│   ├── database.config.ts
│   └── jwt.config.ts
│
├── prisma/
│   └── schema.prisma
│
├── app.module.ts
└── main.ts
```

---

## Certificate Generation Architecture

### Base Generator (Abstract)

```typescript
// src/modules/certificates/generators/base-generator.ts
export interface CertificateData {
  resident: Resident
  barangay: Barangay
  requestedBy: User
  orNumber?: string
  purpose?: string
  issuedDate: Date
}

export abstract class BaseCertificateGenerator {
  abstract generate(data: CertificateData): Promise<Buffer>
  abstract getFormat(): 'PDF' | 'DOCX'
  abstract getCertificateType(): CertificateType
}
```

### Generator Registry (in CertificatesService)

```typescript
// Routing is done via a Map — NOT a switch-case
// This allows 50+ types without code changes to the service
private readonly generators = new Map<CertificateType, BaseCertificateGenerator>()

constructor(
  private readonly barangayClearanceGenerator: BarangayClearanceGenerator,
  // ... inject each generator
) {
  this.generators.set(CertificateType.BARANGAY_CLEARANCE, this.barangayClearanceGenerator)
  // ... register each
}

async generate(certificateId: string, format: 'PDF' | 'DOCX'): Promise<Buffer> {
  const cert = await this.findById(certificateId)
  const generator = this.generators.get(cert.type)
  if (!generator) throw new Error(`No generator for type: ${cert.type}`)
  return generator.generate(await this.buildCertificateData(cert))
}
```

---

## Common Response Envelope

The `TransformInterceptor` wraps all successful responses:

```json
{
  "data": { ... },
  "statusCode": 200,
  "message": "Success"
}
```

Paginated responses include a `meta` field:

```json
{
  "data": [...],
  "meta": { "total": 150, "page": 1, "limit": 20, "totalPages": 8 },
  "statusCode": 200
}
```

---

## Recommended Prisma Schema Modules

| Model | Key Fields |
|---|---|
| `Barangay` | id, name, code, captainName, sealSymbol |
| `Street` | id, streetName, barangayId |
| `Household` | id, houseNumber, streetId, barangayId, classification |
| `Resident` | id, firstName, lastName, birthDate, sex, householdId, barangayId, status flags |
| `User` | id, username, passwordHash, fullName, roleId, barangayId |
| `Role` | id, roleName, permissions (JSON array) |
| `CertificateRequest` | id, type (enum), status, residentId, barangayId, orNumber |
| `AuditLog` | id, tableName, recordId, actionType, performedBy, performedAt |
| `SystemSettings` | id, barangayId, requireApproval, auditRetentionDays |

---

## API Endpoint Summary

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Login, returns JWT tokens |
| POST | `/auth/logout` | Invalidates refresh token |
| POST | `/auth/refresh` | Returns new access token |
| GET | `/auth/me` | Current user profile |
| GET | `/dashboard/stats` | Population stats |
| GET | `/dashboard/birthday-celebrators` | This month's birthdays |
| GET/POST | `/residents` | List / create residents |
| GET/PATCH/DELETE | `/residents/:id` | Get / update / delete resident |
| POST | `/residents/import/csv` | Bulk CSV import |
| GET/POST | `/households` | List / create households |
| GET/PATCH/DELETE | `/households/:id` | Get / update / delete household |
| GET | `/households/:id/members` | Members of a household |
| GET/POST | `/barangays` | List / create barangays |
| GET | `/barangays/:id/streets` | Streets in a barangay |
| GET/POST | `/certificates` | List / create certificate requests |
| PATCH | `/certificates/:id/approve` | Approve request |
| PATCH | `/certificates/:id/reject` | Reject request |
| POST | `/certificates/:id/generate` | Generate PDF/DOCX (future) |
| PATCH | `/certificates/:id/release` | Mark as released |
| POST | `/reports/generate` | Generate report file |
| POST | `/reports/preview` | Preview report as JSON |
| GET/POST | `/users` | List / create system users |
| GET/PATCH | `/settings/:barangayId` | Get / update settings |
| GET | `/settings/:barangayId/audit-log` | Paginated audit log |
