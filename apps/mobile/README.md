# EmpathyLink Mobile (Flutter / Dart Client)

This directory contains the production-ready mobile client architecture for EmpathyLink, built natively in Flutter and Dart.

## Architecture

- **State Management**: `flutter_riverpod` (v2.5+)
- **Routing**: `go_router` (v14+) with declarative routes and authentication state guards
- **Networking**: `dio` (v5+) with automated JWT access/refresh token interceptors
- **Key Storage**: `flutter_secure_storage` using iOS Keychain and Android EncryptedSharedPreferences (Keystore)
- **Real-Time Transport**: `socket_io_client` with secure authentication handshake

## Directory Structure

```
apps/mobile/
├── lib/
│   ├── core/
│   │   ├── network/      # Dio client & token refresh interceptors
│   │   ├── router/       # GoRouter configuration & guards
│   │   ├── storage/      # Secure token & device ID storage
│   │   └── theme/        # Dark midnight violet/cyan theme tokens
│   ├── features/
│   │   ├── auth/         # Login, register, 2FA, session management
│   │   ├── dreamverse/   # Persona creation, universe selector
│   │   ├── heartlink/    # Matching requests, compatibility breakdown
│   │   ├── chat/         # Real-time WebSocket messaging & rooms
│   │   ├── journal/      # Dream Journal with offline draft support
│   │   ├── sol/          # Sol AI reflection assistant
│   │   └── wellness/     # Breathing & gratitude sanctuary
│   └── main.dart
└── pubspec.yaml
```

## Running Mobile

Prerequisites: Flutter SDK >= 3.3.0.

```bash
cd apps/mobile
flutter pub get
flutter run
```
