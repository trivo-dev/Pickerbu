# Client (Angular Universal)

Ứng dụng web công khai cho PickleBall, dùng **Angular 19** với **SSR** (Server-Side Rendering), **SSG/prerender** cho route tĩnh, và server **Express** (`src/server.ts`). Cùng phiên bản stack với `../admin`.

## Development

```bash
cd client
npm install
npm start
```

Mở `http://localhost:4200` (mặc định dùng `environment.development.ts` → API `http://localhost:8080`). Cần backend Spring chạy trước; trang chủ gọi `GET /api/v1/public/courts` để hiển thị danh sách sân đang mở.

## Build + chạy SSR (production)

```bash
npm run build
npm run serve:ssr:client
```

Hoặc gộp: `npm run start:ssr` — build rồi chạy Node; mặc định **port 4000** (đổi bằng biến môi trường `PORT`).

Thư mục output: `dist/client/` (`browser/` + `server/`).

**SSR gọi API:** khi `environment.apiUrl` rỗng (build production mặc định), phía server dùng `http://localhost:8080` hoặc biến môi trường `API_URL` (URL tuyệt đối tới backend) khi chạy `node dist/client/server/server.mjs`.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.24.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
