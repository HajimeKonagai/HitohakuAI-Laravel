<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rules;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;


class UserController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('User/Index', [
        ]);
    }

    public function search(Request $request)
    {
        return User::with('data')->paginate(15);
    }


    public function create()
    {
        return Inertia::render('User/Create');
    }

    public function edit(User $user)
    {
        return Inertia::render('User/Edit', [
            'user' => $user
        ]);
    }


    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        // Auth::login($user);

        // return redirect(RouteServiceProvider::HOME);
        return redirect(route('user'));
    }



    /**
     * Update the user's profile information.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name' => ['string', 'max:255'],
            'email' => ['email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('user.edit', ['user' => $user]);
    }


    /**
     * Update the user's password.
     */
    public function password_update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back();
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if (Auth::id() == $user->id)
        {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $user->delete();

        return Redirect::to('user');
    }

}
