<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class InitAll extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'init-all {name} {email} {password} {is_admin?}';

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

        $this->call('migrate');
        $this->call('init:address-dictionary');
        $this->call('init:plant-dictionary');
        $this->call('init:create-user', [
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'is_admin' => $is_admin,
        ]);
        $user = User::latest('id')->first();

        $this->call('preprocess:create-annotation-from-original', ['user_id' => $user->id]);
        $this->call('preprocess:execute-ocr');
    }
}
