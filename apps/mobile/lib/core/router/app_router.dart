import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const Scaffold(
          body: Center(
            child: Text(
              'EmpathyLink\n“We are there for you. Always for you.”',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18, color: Colors.white70),
            ),
          ),
        ),
      ),
      GoRoute(
        path: '/heartlink',
        builder: (context, state) => const Scaffold(body: Center(child: Text('HeartLink Matching'))),
      ),
      GoRoute(
        path: '/explore',
        builder: (context, state) => const Scaffold(body: Center(child: Text('Explore Circles & Echo Rooms'))),
      ),
      GoRoute(
        path: '/dreamverse',
        builder: (context, state) => const Scaffold(body: Center(child: Text('DreamVerse Personas'))),
      ),
      GoRoute(
        path: '/sol',
        builder: (context, state) => const Scaffold(body: Center(child: Text('Sol Reflection Assistant'))),
      ),
      GoRoute(
        path: '/journal',
        builder: (context, state) => const Scaffold(body: Center(child: Text('Dream Journal'))),
      ),
      GoRoute(
        path: '/wellness',
        builder: (context, state) => const Scaffold(body: Center(child: Text('Wellness Sanctuary'))),
      ),
    ],
  );
});
