<?php

namespace App\Console\Commands\Init;

use Illuminate\Console\Command;

class CreateUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'init:create-user {name} {email} {password} {is_admin?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        $email = $this->argument('email');
        $password = $this->argument('password');
        $is_admin = $this->argument('is_admin');
        $user = \App\Models\User::factory()->create([
            'name' => $name,
            'email' => $email,
            'password' => bcrypt($password),
            'is_admin' => $is_admin ? 1 :0,
            // 'email_verified_at' => date('Y-m-d H:i:s'),
        ]);

        dump('!! user created ID: '.$user->id);
    }
}
