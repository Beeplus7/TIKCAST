# Permission Templates

## Roles (profiles.role)

| Role      | Scenes | Stream | Moderation | Rights | Admin |
|-----------|--------|--------|------------|--------|-------|
| creator   | yes    | yes    | read       | yes    | no    |
| producer  | yes    | yes    | yes        | yes    | no    |
| moderator | no     | no     | yes        | read   | no    |
| admin     | yes    | yes    | yes        | yes    | yes   |

## RLS (simplified)

Authenticated users access channel-scoped tables. Service role used by engine services only.

## API Gateway

Set `SUPABASE_JWT_SECRET` or `SUPABASE_SERVICE_ROLE_KEY` to require `Authorization: Bearer` on `/api/*`.
Leave unset for local development (open routes).