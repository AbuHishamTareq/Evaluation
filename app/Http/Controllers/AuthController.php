<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();
        $remember = $credentials['remember'] ?? false;

        unset($credentials['remember']);

        // Set the application's locale for error messages
        App::setLocale($request->lang ?? 'en');

        if (!Auth::attempt($credentials, $remember)) {
            return Response::json([
                'error' => __('auth.failed'),
            ], 422);
        }

        // ✅ Check if user is active
        $user = Auth::user();
        if ($user->status !== 'active') {
            Auth::logout(); 
            return response()->json([
                'error' => __('auth.inactive'),
            ], 403);
        }

        // ✅ Regenerate session to prevent fixation attacks
        $request->session()->regenerate();

        return response()->json([
            'user' => Auth::user(),
        ]);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        $role = $request->user()?->roles()->pluck('name');
        $permissions = $request->user()?->getAllPermissions()->pluck('name');
        return response()->json([
            'user' => $user,
            'roles' => $role,
            'permissions' => $permissions
        ]);
    }

    public function logout(Request $request)
    {
        // Set the application's locale for error messages
        App::setLocale($request->lang ?? 'en');

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => __('auth.logged_out'),
        ]);
    }
}
