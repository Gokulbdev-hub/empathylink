import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/secure_storage.dart';

final apiClientProvider = Provider<Dio>((ref) {
  final secureStorage = ref.watch(secureStorageProvider);

  final dio = Dio(
    BaseOptions(
      baseUrl: const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:4000/api/v1'),
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await secureStorage.getAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException error, handler) async {
        if (error.response?.statusCode == 401) {
          final refreshToken = await secureStorage.getRefreshToken();
          if (refreshToken != null) {
            try {
              final refreshResponse = await Dio().post(
                '${optionsBaseUrl(dio)}/auth/refresh',
                data: {'refreshToken': refreshToken},
              );
              final newAccessToken = refreshResponse.data['data']['accessToken'];
              final newRefreshToken = refreshResponse.data['data']['refreshToken'];
              await secureStorage.saveTokens(accessToken: newAccessToken, refreshToken: newRefreshToken);

              error.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
              final retryResponse = await dio.fetch(error.requestOptions);
              return handler.resolve(retryResponse);
            } catch (_) {
              await secureStorage.clearTokens();
            }
          }
        }
        return handler.next(error);
      },
    ),
  );

  return dio;
});

String optionsBaseUrl(Dio dio) => dio.options.baseUrl;
