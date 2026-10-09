import 'package:flutter/material.dart';

class AppTheme {
  static const Color background = Color(0xFF0B0F19);
  static const Color surface = Color(0xFF111827);
  static const Color card = Color(0xFF1E293B);
  static const Color border = Color(0xFF334155);
  static const Color violetAccent = Color(0xFF8B5CF6);
  static const Color cyanAccent = Color(0xFF06B6D4);
  static const Color roseAccent = Color(0xFFF43F5E);
  static const Color emeraldAccent = Color(0xFF10B981);
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textMuted = Color(0xFF94A3B8);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: violetAccent,
      cardColor: card,
      colorScheme: const ColorScheme.dark(
        primary: violetAccent,
        secondary: cyanAccent,
        surface: surface,
        error: roseAccent,
      ),
      fontFamily: 'Inter',
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardTheme(
        color: card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: border, width: 1),
        ),
      ),
    );
  }
}
