---
id: angular.services.single-responsibility-services
name: Angular Single Responsibility Services
description: >
  Reviews and refactors Angular services so each service has one bounded responsibility such as API access, state ownership, mapping, validation, permissions, or feature orchestration.
stack:
  - Angular
  - TypeScript
category: services
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - god service
  - single responsibility service
  - Angular service refactor
  - CommonService
  - UtilsService
  - ManagerService
compatibility:
  angular:
    min: "2"
    recommended: "12+"
---

# Angular Single Responsibility Services

## Purpose

Use this skill to split Angular services by responsibility. The goal is to make service names, tests, dependencies, and public contracts reveal what each service owns.

## When to Use

Use this skill when:

- A service has unrelated methods such as login, user API, permissions, export, state, and formatting.
- A service name is generic: `CommonService`, `UtilsService`, `ManagerService`, or `HelperService`.
- A service imports many unrelated domains.
- Tests for one service require mocks for many unrelated dependencies.
- Components rely on one large service as a hidden global dependency.
- A feature needs clearer data-access, state, mapper, or permission boundaries.

## Do

Split by role:

```txt
AuthService
  - login
  - logout
  - session

UserApiService
  - getUsers
  - updateUser
  - deleteUser

UserStateService
  - users$
  - selectedUser$
  - setUsers
  - setSelectedUser

UserMapper
  - DTO to domain or view model transformation

UserPermissionService
  - permission evaluation

UserFacade
  - feature-level API for components
```

Use names that reveal responsibility:

```txt
OrderApiService
OrderStateService
OrderMapper
OrderPermissionService
OrderExportService
OrderFacade
```

Keep pure helpers outside Angular services when dependency injection is not needed:

```ts
export function mapUserDto(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
  };
}
```

## Do Not

Avoid god services:

```ts
@Injectable()
export class UserService {
  login(): void {}
  logout(): void {}
  getUsers(): Observable<User[]> {}
  updateUser(): Observable<User> {}
  setUsers(): void {}
  getCurrentPermissions(): string[] {}
  exportUsersToCsv(): void {}
}
```

Avoid generic names that hide boundaries:

```txt
CommonService
UtilsService
DataService
ManagerService
HelperService
```

Avoid splitting into many files if the service is already cohesive and small.

## Review Checklist

- [ ] The service has one clear reason to change.
- [ ] The service name reveals its role.
- [ ] HTTP communication is separated from state ownership when complexity requires it.
- [ ] Mapping is separated when DTO and UI/domain models differ.
- [ ] Permission logic is not scattered across components.
- [ ] Pure stateless helpers do not require Angular dependency injection.
- [ ] The refactor reduces dependencies in tests.
- [ ] The split is incremental and preserves behavior.

## Expected Output

When this skill is used, the agent should:

1. Identify current service responsibilities.
2. Highlight unrelated methods and dependencies.
3. Propose a role-based service split.
4. Move code incrementally without changing behavior.
5. Recommend focused tests for each new service role.
