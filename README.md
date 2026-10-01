# ifs24047-pabwe2026-reactjs

Aplikasi Lost & Found (Studi Kasus 2.1 PABWE P4) dengan ReactJS + JavaScript, Bun, Tailwind CSS v4, Redux Toolkit, dan React Router. Data dari Delcom Open API (`/lost-founds`).

## Menjalankan

```bash
bun install
cp .env.example .env   # lalu isi VITE_DELCOM_BASEURL=https://open-api.delcom.org/api/v1
bun run dev            # http://localhost:3000 (port dari APP_PORT)
bun run test:coverage  # Vitest + coverage, threshold 100%
bun run build
```

## Rute

| Rute | Halaman |
| --- | --- |
| `/auth/login`, `/auth/register` | Login dan registrasi (AuthLayout) |
| `/` | Daftar laporan, ringkasan metrik, filter, pencarian |
| `/lost-founds/:id` | Detail laporan |
| `/stats` | Statistik harian dan bulanan (menu "Statistik" di sidebar) |
| `/users`, `/profile` | Daftar pengguna dan profil |

## Catatan

- Filter "Laporan saya" memakai parameter API `is_me=1`; filter jenis dan status selesai dilakukan di sisi klien agar angka ringkasan tetap utuh. `lostFoundApi.getLostFounds` tetap mendukung `status`, `is_completed`, dan `is_me`.
- Tombol ubah, ganti foto, dan hapus hanya muncul untuk pemilik laporan (`user_id` sama dengan id profil).
- `toImageUrl` mengubah path cover relatif (`img/lost-founds/...`) menjadi URL penuh.
- CI/CD: `Jenkinsfile` dan `sonar-project.properties` disertakan.
