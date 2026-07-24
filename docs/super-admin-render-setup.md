# Super admin setup for Render + Laravel backend

If your API is Laravel, create a super-admin user in the backend and seed it from a one-off command.

## 1) Add the role to your users table

If you do not already have a `role` column, add it:

```php
// database/migrations/xxxx_xx_xx_xxxxxx_add_role_to_users_table.php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('role')->default('student')->after('email');
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn('role');
    });
}
```

Run:

```bash
php artisan migrate
```

## 2) Create a seeder

```php
// database/seeders/SuperAdminSeeder.php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@bridgeedu.rw'],
            [
                'full_name' => 'Super Admin',
                'email_verified_at' => now(),
                'password' => bcrypt('StrongPassword123!'),
                'role' => 'super_admin',
                'district' => 'Kigali',
                'sector' => 'Nyarugenge',
                'education_level' => 'University',
                'remember_token' => Str::random(10),
            ]
        );
    }
}
```

Register it in `DatabaseSeeder.php`:

```php
$this->call([SuperAdminSeeder::class]);
```

## 3) Run the seeder

```bash
php artisan db:seed --class=SuperAdminSeeder
```

## 4) Render deployment

In Render, set these environment variables for the backend service:

```bash
APP_ENV=production
APP_KEY=your-app-key
DB_CONNECTION=pgsql
DB_HOST=your-db-host
DB_PORT=5432
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
```

Then deploy and run:

```bash
php artisan migrate --force
php artisan db:seed --class=SuperAdminSeeder
```

## 5) Login as super admin

Use the seeded credentials:

- Email: `superadmin@bridgeedu.rw`
- Password: `StrongPassword123!`

Your frontend already routes `super_admin` to the admin experience.

## 6) For full CRUD on users

Make sure your backend exposes CRUD routes for users and authorizes them for `super_admin` only:

```php
if (! $request->user() || $request->user()->role !== 'super_admin') {
    abort(403);
}
```

Example Laravel routes:

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/users', function (Request $request) {
        if ($request->user()->role !== 'super_admin') {
            abort(403);
        }

        return User::paginate(20);
    });

    Route::post('/users', function (Request $request) {
        if ($request->user()->role !== 'super_admin') {
            abort(403);
        }

        $data = $request->validate([
            'full_name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|in:student,mentor,admin,super_admin',
        ]);

        $data['password'] = Hash::make($data['password']);

        return User::create($data);
    });

    Route::put('/users/{user}', function (Request $request, User $user) {
        if ($request->user()->role !== 'super_admin') {
            abort(403);
        }

        $data = $request->validate([
            'full_name' => 'sometimes|required|string',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|min:8|confirmed',
            'role' => 'sometimes|required|in:student,mentor,admin,super_admin',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return $user;
    });

    Route::delete('/users/{user}', function (Request $request, User $user) {
        if ($request->user()->role !== 'super_admin') {
            abort(403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted']);
    });
});
```
